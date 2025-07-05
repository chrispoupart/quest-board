import { Router } from 'express';
import { SkillController } from '../controllers/skillController';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware';
import { validateRequiredFields } from '../middleware/validationMiddleware';

const router = Router();

// Apply authentication middleware to all skill routes
router.use(authMiddleware);

// Public routes (for all authenticated users)
router.get('/', SkillController.getAvailableSkills);
router.get('/my-skills', SkillController.getMySkills);
router.post('/user/:userId', isAdmin, SkillController.updateUserSkill); // Admin can add/update skills for a user
router.put('/user/:userId/:skillId', isAdmin, SkillController.updateUserSkill);
router.delete('/user/:userId/:skillId', isAdmin, SkillController.removeUserSkill);

// Routes for admins to manage skills
router.post('/', isAdmin, SkillController.createSkill);
router.get('/all', isAdmin, SkillController.getAllSkills);
router.put('/:id', isAdmin, SkillController.updateSkill);
router.delete('/:id', isAdmin, SkillController.deleteSkill);

// User skill management routes
/**
 * @openapi
 * /skills/my-skill/{skillId}/level:
 *   get:
 *     summary: Get current user's skill level by skill ID
 *     tags:
 *       - Skills
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User's skill level
 */
router.get('/my-skill/:skillId/level', SkillController.getMySkillLevel);
router.get('/user/:userId', SkillController.getUserSkills);
router.get('/user/:userId/:skillId/level', SkillController.getUserSkillLevel);

export default router;
