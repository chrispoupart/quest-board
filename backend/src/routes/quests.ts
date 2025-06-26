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
router.get('/:id', validateQuestId, QuestController.getQuestById);

// Quest workflow routes (authenticated users)
router.post('/:id/claim', validateQuestId, QuestController.claimQuest);
router.post('/:id/complete', validateQuestId, QuestController.completeQuest);

// Admin/Editor only routes
router.post('/', requireAdminOrEditor, QuestController.createQuest);
router.put('/:id', requireAdminOrEditor, validateQuestId, QuestController.updateQuest);
router.post('/:id/approve', requireAdminOrEditor, validateQuestId, QuestController.approveQuest);
router.post('/:id/reject', requireAdminOrEditor, validateQuestId, QuestController.rejectQuest);

// Admin only routes
router.delete('/:id', requireAdmin, validateQuestId, QuestController.deleteQuest);

export default router;
