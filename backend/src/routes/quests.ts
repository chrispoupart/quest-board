import { Router } from 'express';
import { QuestController } from '../controllers/questController';
import { authMiddleware, isEditorOrAdmin, isAdmin } from '../middleware/authMiddleware';
import { validateQuestId } from '../middleware/validationMiddleware';

const router = Router();

/**
 * @openapi
 * /quests:
 *   get:
 *     summary: Get all quests
 *     tags:
 *       - Quests
 *     responses:
 *       200:
 *         description: List of quests
 */

// Apply authentication middleware to all quest routes
router.use(authMiddleware);

// Public quest routes (authenticated users)
router.get('/', QuestController.getAllQuests);
router.get('/repeatable', QuestController.getRepeatableQuests);
router.get('/my-created', QuestController.getMyCreatedQuests);
router.get('/my-claimed', QuestController.getMyClaimedQuests);
router.get('/my-completion-history', QuestController.getMyCompletionHistory);
router.get('/pending-approval', isEditorOrAdmin, QuestController.getPendingApprovalQuests);
router.get('/:id', validateQuestId, QuestController.getQuestById);

/**
 * @openapi
 * /quests/{id}:
 *   get:
 *     summary: Get quest by ID
 *     tags:
 *       - Quests
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quest details
 */

// Quest workflow routes (authenticated users) - using PUT to match tests
router.put('/:id/claim', validateQuestId, QuestController.claimQuest);
router.put('/:id/complete', validateQuestId, QuestController.completeQuest);
router.put('/:id/approve', validateQuestId, QuestController.approveQuest);
router.put('/:id/reject', validateQuestId, QuestController.rejectQuest);
router.put('/:id/reset', validateQuestId, isAdmin, QuestController.resetRepeatableQuest);
router.post('/:id/claim', validateQuestId, QuestController.claimQuest);  // Keep POST for backward compatibility
router.post('/:id/complete', validateQuestId, QuestController.completeQuest);  // Keep POST for backward compatibility

// Quest skill requirements (all authenticated users can view for eligibility)
router.get('/:id/skill-requirements', validateQuestId, QuestController.getQuestRequiredSkills);

// Admin/Editor only routes
router.post('/', isEditorOrAdmin, QuestController.createQuest);
router.post('/with-skills', isEditorOrAdmin, QuestController.createQuestWithSkills);
router.put('/:id', isEditorOrAdmin, validateQuestId, QuestController.updateQuest);
router.put('/:id/with-skills', isEditorOrAdmin, validateQuestId, QuestController.updateQuestWithSkills);
router.delete('/:id', isAdmin, validateQuestId, QuestController.deleteQuest);

// Quest required skills routes (admin/editor only)
router.get('/:id/required-skills', isEditorOrAdmin, validateQuestId, QuestController.getQuestRequiredSkills);
router.post('/:id/required-skills', isEditorOrAdmin, validateQuestId, QuestController.addQuestRequiredSkill);
router.put('/:id/required-skills/:skillId', isEditorOrAdmin, validateQuestId, QuestController.updateQuestRequiredSkill);
router.delete('/:id/required-skills/:skillId', isEditorOrAdmin, validateQuestId, QuestController.removeQuestRequiredSkill);

export default router;
