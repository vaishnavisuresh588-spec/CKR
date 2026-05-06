import { Router } from 'express';
import multer from 'multer';
import { analyzeClaims, analyzeFile, compareFiles, compareUrls } from '../controllers/claims.js';

const router = Router();
const upload      = multer({ storage: multer.memoryStorage() });
const uploadTwo   = multer({ storage: multer.memoryStorage() }).fields([
  { name: 'fileA', maxCount: 1 },
  { name: 'fileB', maxCount: 1 },
]);

router.post('/analyze',        analyzeClaims);
router.post('/analyze-file',   upload.single('file'),  analyzeFile);
router.post('/compare-files',  uploadTwo,              compareFiles);
router.post('/compare-urls',   compareUrls);

export default router;
