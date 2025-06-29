import { Router } from 'express';
import { QuestController } from '../controllers/questController';
import { authenticateToken, requireAdminOrEditor, requireAdmin } from '../middleware/authMiddleware';
import { validateQuestId } from '../middleware/validationMiddleware';

const router = Router();

// Apply authentication middleware to all quest routes
router.use(authenticateToken);

// Public quest routes (authenticated users)
router.get('/', QuestController.getAllQuests);
router.get('/repeatable', QuestController.getRepeatableQuests);
router.get('/my-created', QuestController.getMyCreatedQuests);
router.get('/my-claimed', QuestController.getMyClaimedQuests);
router.get('/my-completion-history', QuestController.getMyCompletionHistory);
router.get('/:id', validateQuestId, QuestController.getQuestById);

// Quest workflow routes (authenticated users)
router.post('/:id/claim', validateQuestId, QuestController.claimQuest);
router.post('/:id/complete', validateQuestId, QuestController.completeQuest);

// Quest skill requirements (all authenticated users can view for eligibility)
router.get('/:id/skill-requirements', validateQuestId, QuestController.getQuestRequiredSkills);

// Admin/Editor only routes
router.post('/', requireAdminOrEditor, QuestController.createQuest);
router.post('/with-skills', requireAdminOrEditor, QuestController.createQuestWithSkills);
router.put('/:id', requireAdminOrEditor, validateQuestId, QuestController.updateQuest);
router.put('/:id/with-skills', requireAdminOrEditor, validateQuestId, QuestController.updateQuestWithSkills);
router.post('/:id/approve', requireAdminOrEditor, validateQuestId, QuestController.approveQuest);
router.post('/:id/reject', requireAdminOrEditor, validateQuestId, QuestController.rejectQuest);

// Quest required skills routes (admin/editor only)
router.get('/:id/required-skills', requireAdminOrEditor, validateQuestId, QuestController.getQuestRequiredSkills);
router.post('/:id/required-skills', requireAdminOrEditor, validateQuestId, QuestController.addQuestRequiredSkill);
router.put('/:id/required-skills/:skillId', requireAdminOrEditor, validateQuestId, QuestController.updateQuestRequiredSkill);
router.delete('/:id/required-skills/:skillId', requireAdminOrEditor, validateQuestId, QuestController.removeQuestRequiredSkill);

// Admin only routes
router.delete('/:id', requireAdmin, validateQuestId, QuestController.deleteQuest);

export default router;
