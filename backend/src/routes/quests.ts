import { Router } from 'express';

const router = Router();

// TODO: Implement quest routes
router.get('/', (req, res) => {
  res.json({ message: 'List quests endpoint' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get quest endpoint', id: req.params.id });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create quest endpoint' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Update quest endpoint', id: req.params.id });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete quest endpoint', id: req.params.id });
});

router.post('/:id/claim', (req, res) => {
  res.json({ message: 'Claim quest endpoint', id: req.params.id });
});

router.post('/:id/complete', (req, res) => {
  res.json({ message: 'Complete quest endpoint', id: req.params.id });
});

router.post('/:id/approve', (req, res) => {
  res.json({ message: 'Approve quest endpoint', id: req.params.id });
});

router.post('/:id/reject', (req, res) => {
  res.json({ message: 'Reject quest endpoint', id: req.params.id });
});

export default router;
