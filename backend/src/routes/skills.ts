import { Router } from 'express';
import { SkillController } from '../controllers/skillController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// Skill management routes (admin only)
router.get('/', SkillController.getAllSkills);
router.get('/quest-creation', SkillController.getSkillsForQuestCreation);
router.post('/', SkillController.createSkill);
router.put('/:id', SkillController.updateSkill);
router.delete('/:id', SkillController.deleteSkill);

// User skill management routes
router.get('/my-skills', SkillController.getMySkills);
router.get('/my-skill/:skillId/level', SkillController.getMySkillLevel);
router.get('/user/:userId', SkillController.getUserSkills);
router.get('/user/:userId/:skillId/level', SkillController.getUserSkillLevel);
router.post('/user/:userId', SkillController.updateUserSkill);
router.delete('/user/:userId/:skillId', SkillController.removeUserSkill);

export default router;
