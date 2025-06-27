#!/usr/bin/env node

/**
 * Test script to verify quest claim validation
 * This script tests the security fix for quest claiming without proper skill requirements
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test data
const testUser = {
    email: 'test@example.com',
    password: 'testpassword123'
};

const testQuest = {
    title: 'Test Quest with Skills',
    description: 'A test quest that requires specific skills',
    bounty: 100,
    skillRequirements: [
        { skillId: 1, minLevel: 3 } // Requires skill ID 1 at level 3
    ]
};

async function testQuestClaimValidation() {
    console.log('🧪 Testing Quest Claim Validation Security Fix\n');

    try {
        // Step 1: Login as test user
        console.log('1. Logging in as test user...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testUser);
        const token = loginResponse.data.data.token;
        const userId = loginResponse.data.data.user.id;

        console.log(`   ✅ Logged in as user ID: ${userId}`);

        // Step 2: Create a test skill (if admin)
        console.log('\n2. Creating test skill...');
        let skillId;
        try {
            const skillResponse = await axios.post(`${BASE_URL}/skills`, {
                name: 'Test Skill',
                description: 'A test skill for validation'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            skillId = skillResponse.data.data.id;
            console.log(`   ✅ Created skill ID: ${skillId}`);
        } catch (error) {
            if (error.response?.status === 403) {
                console.log('   ⚠️  Not admin, using existing skill ID: 1');
                skillId = 1;
            } else {
                throw error;
            }
        }

        // Step 3: Create a quest with skill requirements
        console.log('\n3. Creating quest with skill requirements...');
        const questResponse = await axios.post(`${BASE_URL}/quests/with-skills`, {
            ...testQuest,
            skillRequirements: [{ skillId, minLevel: 3 }]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const questId = questResponse.data.data.id;
        console.log(`   ✅ Created quest ID: ${questId}`);

        // Step 4: Try to claim quest without required skills (should fail)
        console.log('\n4. Testing claim without required skills...');
        try {
            await axios.post(`${BASE_URL}/quests/${questId}/claim`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('   ❌ SECURITY VULNERABILITY: Quest claimed without skill requirements!');
            return false;
        } catch (error) {
            if (error.response?.status === 403) {
                console.log('   ✅ SECURITY FIX WORKING: Quest claim properly rejected due to missing skills');
                console.log(`   📝 Error message: ${error.response.data.error.message}`);

                if (error.response.data.error.missingSkills) {
                    console.log(`   📋 Missing skills: ${error.response.data.error.missingSkills.join(', ')}`);
                }
                if (error.response.data.error.insufficientSkills) {
                    console.log(`   📋 Insufficient skills: ${error.response.data.error.insufficientSkills.join(', ')}`);
                }
            } else {
                console.log(`   ❌ Unexpected error: ${error.response?.status} - ${error.response?.data?.error?.message}`);
                return false;
            }
        }

        // Step 5: Assign skill to user at insufficient level
        console.log('\n5. Assigning skill at insufficient level...');
        try {
            await axios.post(`${BASE_URL}/skills/user/${userId}`, {
                skillId,
                level: 1 // Below required level 3
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('   ✅ Assigned skill at level 1');
        } catch (error) {
            if (error.response?.status === 403) {
                console.log('   ⚠️  Not admin, skipping skill assignment test');
            } else {
                console.log(`   ⚠️  Could not assign skill: ${error.response?.data?.error?.message}`);
            }
        }

        // Step 6: Try to claim quest with insufficient skill level (should fail)
        console.log('\n6. Testing claim with insufficient skill level...');
        try {
            await axios.post(`${BASE_URL}/quests/${questId}/claim`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('   ❌ SECURITY VULNERABILITY: Quest claimed with insufficient skill level!');
            return false;
        } catch (error) {
            if (error.response?.status === 403) {
                console.log('   ✅ SECURITY FIX WORKING: Quest claim properly rejected due to insufficient skill level');
                console.log(`   📝 Error message: ${error.response.data.error.message}`);
            } else {
                console.log(`   ❌ Unexpected error: ${error.response?.status} - ${error.response?.data?.error?.message}`);
                return false;
            }
        }

        // Step 7: Assign skill at required level (if admin)
        console.log('\n7. Assigning skill at required level...');
        try {
            await axios.put(`${BASE_URL}/skills/user/${userId}`, {
                skillId,
                level: 3 // Required level
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('   ✅ Updated skill to level 3');
        } catch (error) {
            if (error.response?.status === 403) {
                console.log('   ⚠️  Not admin, skipping skill update test');
            } else {
                console.log(`   ⚠️  Could not update skill: ${error.response?.data?.error?.message}`);
            }
        }

        // Step 8: Try to claim quest with proper skills (should succeed)
        console.log('\n8. Testing claim with proper skills...');
        try {
            const claimResponse = await axios.post(`${BASE_URL}/quests/${questId}/claim`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('   ✅ Quest successfully claimed with proper skills');
            console.log(`   📝 Quest status: ${claimResponse.data.data.status}`);
        } catch (error) {
            console.log(`   ❌ Failed to claim quest: ${error.response?.data?.error?.message}`);
            return false;
        }

        console.log('\n🎉 ALL TESTS PASSED! Quest claim validation is working correctly.');
        console.log('🔒 Security vulnerability has been fixed.');
        return true;

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
        return false;
    }
}

// Run the test
if (require.main === module) {
    testQuestClaimValidation()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('Test execution failed:', error);
            process.exit(1);
        });
}

module.exports = { testQuestClaimValidation };
