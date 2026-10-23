import "server-only";
import type { PoolClient } from "pg";
import { parseScene, type SceneId, type TemplateId } from "./video-templates";

// No process cache: edits apply to the next new order. The order itself keeps an immutable snapshot.
export async function loadPromptSnapshot(db: PoolClient, templateId: TemplateId, sceneId: SceneId) {
  if (!parseScene(templateId, sceneId)) throw new Error("This video option has an invalid scene.");
  const row = (await db.query<{base_prompt:string;prompt_version:string}>(
    `SELECT base_prompt,prompt_version FROM zombievideolab_pro.video_prompt_templates
     WHERE template_id=$1 AND scene_id=$2 AND is_active FOR SHARE`, [templateId,sceneId])).rows[0];
  if (!row?.base_prompt.trim() || row.prompt_version !== "tiptoeing-db-v1")
    throw new Error("This video option has no active prompt configuration. Please contact support.");
  if (sceneId === "dancer-only" && /@?Image\s*2\b/i.test(row.base_prompt))
    throw new Error("This video option has an invalid single-photo prompt. Please contact support.");
  return {promptVersion:row.prompt_version,promptSnapshot:row.base_prompt};
}
