import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getCloudinary } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LOCAL_DIR = path.resolve(__dirname, '../../uploads');

export const storageService = {

  async uploadPdf(file) {
    const cloud = getCloudinary();
    if (cloud) return this._uploadToCloudinary(cloud, file);
    return this._uploadToLocal(file);
  },

  async deleteFile({ publicId, provider }) {
    try {
      if (provider === 'cloudinary') {
        const cloud = getCloudinary();
        if (cloud) await cloud.uploader.destroy(publicId, { resource_type: 'raw' });
      } else {
        await fs.unlink(path.join(LOCAL_DIR, publicId)).catch(() => {});
      }
    } catch (err) {
      logger.warn(`Failed to delete stored file ${publicId}: ${err.message}`);
    }
  },

  async readPdf({ publicId, url, provider }) {
    if (provider === 'local') {
      return fs.readFile(path.join(LOCAL_DIR, publicId));
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch stored PDF (${res.status})`);
    return Buffer.from(await res.arrayBuffer());
  },

  async _uploadToCloudinary(cloud, file) {
    const publicId = `smart-docs/${crypto.randomUUID()}`;
    const result = await new Promise((resolve, reject) => {
      const stream = cloud.uploader.upload_stream(
        { resource_type: 'raw', public_id: publicId, format: 'pdf' },
        (err, res) => (err ? reject(err) : resolve(res))
      );
      stream.end(file.buffer);
    });
    return { url: result.secure_url, publicId: result.public_id, provider: 'cloudinary' };
  },

  async _uploadToLocal(file) {
    await fs.mkdir(LOCAL_DIR, { recursive: true });
    const filename = `${crypto.randomUUID()}.pdf`;
    await fs.writeFile(path.join(LOCAL_DIR, filename), file.buffer);
    logger.debug(`Stored PDF locally: ${filename}`);
    return { url: `/uploads/${filename}`, publicId: filename, provider: 'local' };
  },
};

export const LOCAL_UPLOAD_DIR = LOCAL_DIR;
export default storageService;
