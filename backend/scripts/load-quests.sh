#!/usr/bin/env sh

# Load quests from JSON file into the quest board database
# Usage: ./load-quests.sh [json_file]

set -e

# Error handling function
handle_error() {
  exit_code=$?
  line_number=$1
  echo "Error occurred in script at line: ${line_number}, exit code: ${exit_code}" >&2
  exit "${exit_code}"
}

# Set up error handling
trap 'handle_error ${LINENO}' ERR

# Default values
DEFAULT_JSON_FILE="prisma/default.json"

# Parse command line arguments
JSON_FILE="${1:-${DEFAULT_JSON_FILE}}"

# Validate input file exists
if [ ! -f "${JSON_FILE}" ]; then
  echo "Error: JSON file '${JSON_FILE}' not found" >&2
  exit 1
fi

# Check if we're in the backend directory
if [ ! -f "package.json" ] || [ ! -d "prisma" ]; then
  echo "Error: Must run this script from the backend directory" >&2
  exit 1
fi

# Check if Node.js and npm are available
if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is not installed or not in PATH" >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not installed or not in PATH" >&2
  exit 1
fi

# Check if Prisma is installed
if [ ! -d "node_modules/.prisma" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Generate Prisma client if needed
if [ ! -f "node_modules/.prisma/client/index.js" ]; then
  echo "Generating Prisma client..."
  npx prisma generate
fi

echo "Loading quests from ${JSON_FILE}..."

# Create the JavaScript script to load the data
cat > load-quests-temp.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function loadQuests(jsonFile) {
  try {
    console.log('🌱 Starting quest loading process...');

    // Read and parse JSON file
    const filePath = path.resolve(jsonFile);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    // Find the first admin user in the database
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      throw new Error('No admin user found in database. Please create an admin user first.');
    }

    console.log(`✅ Using admin user: ${adminUser.name} (${adminUser.email})`);

    // Create skills if provided
    if (data.skills && data.skills.length > 0) {
      console.log(`📚 Creating ${data.skills.length} skills...`);
      for (const skillData of data.skills) {
        const existingSkill = await prisma.skill.findUnique({
          where: { name: skillData.name }
        });

        if (!existingSkill) {
          await prisma.skill.create({
            data: {
              name: skillData.name,
              description: skillData.description,
              createdBy: adminUser.id
            }
          });
          console.log(`✅ Created skill: ${skillData.name}`);
        } else {
          console.log(`⏭️  Skill already exists: ${skillData.name}`);
        }
      }
    }

    // Create quests
    console.log(`📋 Creating ${data.quests.length} quests...`);
    for (const questData of data.quests) {
      // Check if quest already exists by title
      const existingQuest = await prisma.quest.findFirst({
        where: { title: questData.title }
      });

      if (existingQuest) {
        console.log(`⏭️  Quest already exists: ${questData.title}`);
        continue;
      }

      // Create the quest
      const quest = await prisma.quest.create({
        data: {
          title: questData.title,
          description: questData.description,
          bounty: questData.bounty,
          isRepeatable: questData.isRepeatable ?? false,
          cooldownDays: questData.cooldownDays,
          status: questData.status ?? 'AVAILABLE',
          createdBy: adminUser.id,
        },
      });

      console.log(`✅ Created quest: ${quest.title} (Bounty: ${quest.bounty})`);

      // Add required skills if specified
      if (questData.requiredSkills && questData.requiredSkills.length > 0) {
        for (const requiredSkill of questData.requiredSkills) {
          const skill = await prisma.skill.findUnique({
            where: { name: requiredSkill.skillName }
          });

          if (skill) {
            await prisma.questRequiredSkill.create({
              data: {
                questId: quest.id,
                skillId: skill.id,
                minLevel: requiredSkill.minLevel,
              },
            });
            console.log(`  🔗 Added skill requirement: ${skill.name} (Level ${requiredSkill.minLevel})`);
          } else {
            console.log(`  ⚠️  Warning: Skill '${requiredSkill.skillName}' not found for quest '${quest.title}'`);
          }
        }
      }
    }

    console.log('✅ Quest loading completed successfully!');

    // Print summary
    const questCount = await prisma.quest.count();
    const skillCount = await prisma.skill.count();
    const requirementCount = await prisma.questRequiredSkill.count();

    console.log(`📊 Summary:`);
    console.log(`  📋 Total Quests: ${questCount}`);
    console.log(`  🎯 Total Skills: ${skillCount}`);
    console.log(`  🔗 Total Skill Requirements: ${requirementCount}`);

  } catch (error) {
    console.error('❌ Error loading quests:', error);
    throw error;
  }
}

// Get command line arguments
const jsonFile = process.argv[2] || 'prisma/default.json';

loadQuests(jsonFile)
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF

# Run the JavaScript script
echo "Executing quest loading script..."
node load-quests-temp.js "${JSON_FILE}"

# Clean up temporary file
rm -f load-quests-temp.js

echo "🎉 Quest loading completed!"
