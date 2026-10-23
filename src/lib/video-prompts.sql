-- Additive migration: no product/price/order state changes. Re-running preserves edited prompts.
CREATE TABLE IF NOT EXISTS zombievideolab_pro.video_prompt_templates (
 template_id text NOT NULL,
 scene_id text NOT NULL,
 scene_description text NOT NULL,
 base_prompt text NOT NULL CHECK (length(btrim(base_prompt)) > 0),
 prompt_version text NOT NULL DEFAULT 'tiptoeing-db-v1',
 is_active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (template_id, scene_id)
);
COMMENT ON COLUMN zombievideolab_pro.video_prompt_templates.base_prompt IS 'English scene storyboard. Image 1 = dancer; Image 2 = uploaded observer only in two-person mode. Safety, duration, framing and reference rules are appended by the server.';
ALTER TABLE zombievideolab_pro.billing_orders ADD COLUMN IF NOT EXISTS scene_id text NOT NULL DEFAULT 'two-person';
ALTER TABLE zombievideolab_pro.billing_orders ADD COLUMN IF NOT EXISTS prompt_snapshot text;
-- Old paid orders keep their original version and null snapshot; their code fallback remains executable.

INSERT INTO zombievideolab_pro.video_prompt_templates (template_id,scene_id,scene_description,base_prompt)
VALUES ('tiptoeing-in-my-jordans','dancer-only','One uploaded dancer; preserve the observer from the provided reference video.',$prompt$# Tiptoeing in My Jordans — Dancer Replacement With Reference Observer

## 1. INPUT REFERENCES AND PRIORITY

You will receive two visual references: one dancer photo and one reference video. The output still contains two adults.

- **Reference Video:** The uploaded original “Tiptoeing in My Jordans” dance meme. Use it as the primary reference for choreography, body poses, facial expressions, shot sequence, camera framing, editing rhythm, and comedic timing.
- **Image 1 — DANCER:** The person in the first uploaded image MUST be the main dancer. This person performs the entire signature tiptoeing routine.
- **REFERENCE VIDEO — OBSERVER:** The seated observer from the reference video MUST remain the seated observer. This person watches the dancer and reacts with increasing surprise.

These character assignments are mandatory and must never be swapped.

Use the reference video to guide the movement and editing. Use Image 1 for the dancer’s identity and appearance; use the reference video for the observer’s identity and appearance. Recreate the recognizable original performance rather than inventing a different dance.

## 2. CHARACTER IDENTITY AND APPEARANCE

**Image 1 — Main Dancer**

Preserve the first person's recognizable facial identity, facial features, hairstyle, hair color, skin tone, body proportions, clothing, footwear, jewelry, and accessories. The dancer must remain visually consistent throughout every shot.

**Reference Video — Seated Observer**

Preserve the reference observer's recognizable facial identity, facial features, hairstyle, hair color, skin tone, body proportions, clothing, jewelry, and accessories. This person remains seated beside the dancer and reacts naturally to the performance.

Do not exchange their roles, merge their facial identities, duplicate either character, or transfer clothing and accessories from one person to the other. Do not redesign their outfits or replace their original footwear.

## 3. SCENE AND ENVIRONMENT

A rustic, old-fashioned wooden barn with weathered timber walls, golden hay scattered across the floor, and stacked hay bales in the background. Warm amber tungsten lighting creates a nostalgic, slightly surreal atmosphere.

Subtle floating dust particles, soft cinematic shadows, natural skin texture, and restrained vintage film grain create the feeling of an eccentric scene from an old music video.

Keep the environment consistent across all shots. The scene should feel charming, quirky, playful, and slightly absurd, not like a modern dance studio or a glossy music-video set.

## 4. CHOREOGRAPHY AND SHOT SEQUENCE

Target duration: approximately 15 seconds, following the timing and shot rhythm of the uploaded reference video as closely as the generation workflow allows.

**0–2 seconds — The Shushing Gesture**

The dancer from Image 1 faces the seated observer from the reference video. The dancer raises one index finger to the lips and performs a clear, playful “shh” gesture. Maintain a mischievous expression, slightly raised eyebrows, and direct eye contact with the observer, as if preparing to perform a ridiculous secret dance.

Use a brief facial close-up or medium close-up, consistent with the reference video.

**2–4 seconds — The Mischievous Expression**

The dancer lowers the finger and gives the observer a cheeky, knowing grin. The observer watches attentively, initially curious and then beginning to look surprised.

Use brief, purposeful cuts between the dancer's expression and the observer's reaction. Preserve the original characters and their positions.

**4–6 seconds — Preparing to Dance**

Return to a medium-wide or full-body shot. The dancer bends both knees slightly, lowers the center of gravity, and extends both arms sideways like wings to maintain balance.

The shoulders remain relaxed, the torso leans forward slightly, and the facial expression stays playful and mischievous. Both legs and feet must be visible before the main dance begins.

**6–9 seconds — The Signature Tiptoeing Dance**

The dancer performs the distinctive “Tiptoeing in My Jordans” movement.

Keep both knees softly bent. Raise the heels off the floor and shift body weight rapidly and rhythmically between the left and right forefeet. Alternate the feet in small, quick, precise steps, repeatedly lifting and lowering the heels while the forefeet remain in believable contact with the floor.

The dancer's arms extend outward to either side and make small natural adjustments for balance. The upper body bounces subtly with the rhythm. The expression is cheeky, confident, and comically serious about the ridiculous performance.

The movement must clearly read as alternating tiptoe footwork, not ordinary walking, running, jumping, marching, shuffling, or a generic dance routine.

Keep the dancer's entire body, including both feet, inside the frame during the main performance.

**9–12 seconds — Footwork Close-Up**

Cut to a low-angle close-up of the dancer's lower legs and shoes.

Clearly show the repeated heel lifts, alternating left-right weight shifts, and quick forefoot steps on the hay-covered floor. Keep the footwork rhythmically consistent with the previous wide shot.

Maintain anatomically correct feet, natural ankle movement, stable shoes, and believable contact with the ground. Do not allow the feet to slide, float, merge, or deform.

The shoes must match the footwear in Image 1.

**12–14 seconds — Full Performance**

Return to a medium-wide or full-body shot. The dancer continues the same signature footwork with knees bent, heels lifted, arms extended, and a mischievous grin.

Do not introduce new choreography. Preserve the same movement pattern, body proportions, clothing, and character identity.

**14–15 seconds — The Observer's Reaction**

Cut briefly to the seated observer from the reference video, still seated beside the dancer. The observer widens their eyes, raises their eyebrows, and reacts with genuine comic astonishment, possibly bringing one hand toward the mouth.

Finish with a brief glimpse of the dancer's cheeky expression if the timing permits. The humor should come from the contrast between the dancer's absurdly confident performance and the observer's surprised reaction.

## 5. CAMERA, FRAMING, AND EDITING

Reproduce the reference video's recognizable visual rhythm through deliberate cuts between facial close-ups, medium-wide performance shots, lower-leg and foot close-ups, and the observer's reaction.

The camera must show the actual choreography rather than merely imply that dancing is happening.

During the main dance, prioritize medium-wide or full-body framing. Both legs and both feet must remain visible. Include a dedicated foot-level shot that clearly reveals the alternating heel lifts and forefoot contact.

Use facial close-ups only for the shushing gesture, mischievous expression, and observer reaction. Do not allow facial close-ups to replace the dance sequence.

Keep camera movement restrained and purposeful. Avoid random zooms, excessive camera shake, unnecessary slow motion, abrupt changes in location, and inconsistent character positioning.

Follow the reference video's action order and comedic pacing as closely as possible. If a direct shot-for-shot match is not possible, preserve the signature dance, essential gestures, and overall sequence before adding any stylistic interpretation.

## 6. VISUAL QUALITY AND TEMPORAL CONSISTENCY

Photorealistic live-action footage with a nostalgic vintage-film aesthetic.

Use warm amber lighting, detailed wooden textures, realistic hay, natural skin texture, believable fabric movement, consistent shadows, and smooth motion between frames.

Maintain stable facial identity, hairstyle, clothing, accessories, body proportions, footwear, and character positions across every shot.

The result should look like a coherent, professionally edited recreation of the classic meme, not a collection of unrelated AI-generated shots.

## 7. AUDIO

Generate native background music together with the video. Listen to the attached reference video's audio and use its approximate tempo, rhythmic groove, energy, mood and instrumentation as guidance for a new, similar instrumental backing track. Keep the music audible and continuous throughout the 15-second output. Coordinate alternating tiptoe steps, weight shifts, gestures and shot transitions with the musical beat while preserving the ordered visual storyboard and natural movement. Aim for a shared musical pulse rather than forced or unnatural exact beat matching. Do not copy the original melody, lyrics, vocals or sound recording; do not add spoken dialogue. Do not produce a silent output.

## 8. STRICT NEGATIVE CONSTRAINTS

No character swapping. No identity blending. No duplicated characters. No changes to the uploaded people's original clothing, footwear, jewelry, or accessories. No generic dance substitutions. No ordinary walking in place. No running. No jumping. No random choreography. No missing limbs. No extra limbs. No malformed hands. No distorted feet. No fused shoes. No sliding feet. No floating heels. No impossible ankle rotations. No abrupt body-size changes. No flickering faces. No inconsistent hairstyles. No sudden costume changes. No random scene changes. No excessive motion blur. No persistent face-only framing. No cropping out the feet during the main dance. No text overlays. No subtitles. No watermarks.

## 9. FINAL REFERENCE-FIDELITY REQUIREMENT

The uploaded reference video is the primary guide for the recognizable choreography, expression changes, camera rhythm, shot order, and comedic timing. Do not redesign the dance or replace it with a modern routine.

Image 1 must always be the dancer. The reference video supplies the seated observer throughout.

Prioritize the distinctive bent-knee posture, lifted heels, alternating forefoot steps, outstretched arms, mischievous expression, dedicated footwork close-up, and surprised observer.

The goal is a faithful, recognizable recreation of the classic “Tiptoeing in My Jordans” meme, with the uploaded dancer and original reference observer convincingly integrated into the original performance and their appearances preserved throughout.$prompt$)
ON CONFLICT (template_id,scene_id) DO NOTHING;

INSERT INTO zombievideolab_pro.video_prompt_templates (template_id,scene_id,scene_description,base_prompt)
VALUES ('tiptoeing-in-my-jordans','two-person','Two uploaded portraits: dancer first, seated observer second.',$prompt$# Tiptoeing in My Jordans — Faithful Two-Person Recreation

## 1. INPUT REFERENCES AND PRIORITY

You will receive three visual references:

- **Reference Video:** The uploaded original “Tiptoeing in My Jordans” dance meme. Use it as the primary reference for choreography, body poses, facial expressions, shot sequence, camera framing, editing rhythm, and comedic timing.
- **Image 1 — DANCER:** The person in the first uploaded image MUST be the main dancer. This person performs the entire signature tiptoeing routine.
- **Image 2 — OBSERVER:** The person in the second uploaded image MUST be the seated observer. This person watches the dancer and reacts with increasing surprise.

These character assignments are mandatory and must never be swapped.

Use the reference video to guide the movement and editing. Use Image 1 and Image 2 to preserve the respective characters’ identities and appearances. Recreate the recognizable original performance rather than inventing a different dance.

## 2. CHARACTER IDENTITY AND APPEARANCE

**Image 1 — Main Dancer**

Preserve the first person's recognizable facial identity, facial features, hairstyle, hair color, skin tone, body proportions, clothing, footwear, jewelry, and accessories. The dancer must remain visually consistent throughout every shot.

**Image 2 — Seated Observer**

Preserve the second person's recognizable facial identity, facial features, hairstyle, hair color, skin tone, body proportions, clothing, jewelry, and accessories. This person remains seated beside the dancer and reacts naturally to the performance.

Do not exchange their roles, merge their facial identities, duplicate either character, or transfer clothing and accessories from one person to the other. Do not redesign their outfits or replace their original footwear.

## 3. SCENE AND ENVIRONMENT

A rustic, old-fashioned wooden barn with weathered timber walls, golden hay scattered across the floor, and stacked hay bales in the background. Warm amber tungsten lighting creates a nostalgic, slightly surreal atmosphere.

Subtle floating dust particles, soft cinematic shadows, natural skin texture, and restrained vintage film grain create the feeling of an eccentric scene from an old music video.

Keep the environment consistent across all shots. The scene should feel charming, quirky, playful, and slightly absurd, not like a modern dance studio or a glossy music-video set.

## 4. CHOREOGRAPHY AND SHOT SEQUENCE

Target duration: approximately 15 seconds, following the timing and shot rhythm of the uploaded reference video as closely as the generation workflow allows.

**0–2 seconds — The Shushing Gesture**

The dancer from Image 1 faces the seated observer from Image 2. The dancer raises one index finger to the lips and performs a clear, playful “shh” gesture. Maintain a mischievous expression, slightly raised eyebrows, and direct eye contact with the observer, as if preparing to perform a ridiculous secret dance.

Use a brief facial close-up or medium close-up, consistent with the reference video.

**2–4 seconds — The Mischievous Expression**

The dancer lowers the finger and gives the observer a cheeky, knowing grin. The observer watches attentively, initially curious and then beginning to look surprised.

Use brief, purposeful cuts between the dancer's expression and the observer's reaction. Preserve the original characters and their positions.

**4–6 seconds — Preparing to Dance**

Return to a medium-wide or full-body shot. The dancer bends both knees slightly, lowers the center of gravity, and extends both arms sideways like wings to maintain balance.

The shoulders remain relaxed, the torso leans forward slightly, and the facial expression stays playful and mischievous. Both legs and feet must be visible before the main dance begins.

**6–9 seconds — The Signature Tiptoeing Dance**

The dancer performs the distinctive “Tiptoeing in My Jordans” movement.

Keep both knees softly bent. Raise the heels off the floor and shift body weight rapidly and rhythmically between the left and right forefeet. Alternate the feet in small, quick, precise steps, repeatedly lifting and lowering the heels while the forefeet remain in believable contact with the floor.

The dancer's arms extend outward to either side and make small natural adjustments for balance. The upper body bounces subtly with the rhythm. The expression is cheeky, confident, and comically serious about the ridiculous performance.

The movement must clearly read as alternating tiptoe footwork, not ordinary walking, running, jumping, marching, shuffling, or a generic dance routine.

Keep the dancer's entire body, including both feet, inside the frame during the main performance.

**9–12 seconds — Footwork Close-Up**

Cut to a low-angle close-up of the dancer's lower legs and shoes.

Clearly show the repeated heel lifts, alternating left-right weight shifts, and quick forefoot steps on the hay-covered floor. Keep the footwork rhythmically consistent with the previous wide shot.

Maintain anatomically correct feet, natural ankle movement, stable shoes, and believable contact with the ground. Do not allow the feet to slide, float, merge, or deform.

The shoes must match the footwear in Image 1.

**12–14 seconds — Full Performance**

Return to a medium-wide or full-body shot. The dancer continues the same signature footwork with knees bent, heels lifted, arms extended, and a mischievous grin.

Do not introduce new choreography. Preserve the same movement pattern, body proportions, clothing, and character identity.

**14–15 seconds — The Observer's Reaction**

Cut briefly to the person in Image 2, still seated beside the dancer. The observer widens their eyes, raises their eyebrows, and reacts with genuine comic astonishment, possibly bringing one hand toward the mouth.

Finish with a brief glimpse of the dancer's cheeky expression if the timing permits. The humor should come from the contrast between the dancer's absurdly confident performance and the observer's surprised reaction.

## 5. CAMERA, FRAMING, AND EDITING

Reproduce the reference video's recognizable visual rhythm through deliberate cuts between facial close-ups, medium-wide performance shots, lower-leg and foot close-ups, and the observer's reaction.

The camera must show the actual choreography rather than merely imply that dancing is happening.

During the main dance, prioritize medium-wide or full-body framing. Both legs and both feet must remain visible. Include a dedicated foot-level shot that clearly reveals the alternating heel lifts and forefoot contact.

Use facial close-ups only for the shushing gesture, mischievous expression, and observer reaction. Do not allow facial close-ups to replace the dance sequence.

Keep camera movement restrained and purposeful. Avoid random zooms, excessive camera shake, unnecessary slow motion, abrupt changes in location, and inconsistent character positioning.

Follow the reference video's action order and comedic pacing as closely as possible. If a direct shot-for-shot match is not possible, preserve the signature dance, essential gestures, and overall sequence before adding any stylistic interpretation.

## 6. VISUAL QUALITY AND TEMPORAL CONSISTENCY

Photorealistic live-action footage with a nostalgic vintage-film aesthetic.

Use warm amber lighting, detailed wooden textures, realistic hay, natural skin texture, believable fabric movement, consistent shadows, and smooth motion between frames.

Maintain stable facial identity, hairstyle, clothing, accessories, body proportions, footwear, and character positions across every shot.

The result should look like a coherent, professionally edited recreation of the classic meme, not a collection of unrelated AI-generated shots.

## 7. AUDIO

Generate native background music together with the video. Listen to the attached reference video's audio and use its approximate tempo, rhythmic groove, energy, mood and instrumentation as guidance for a new, similar instrumental backing track. Keep the music audible and continuous throughout the 15-second output. Coordinate alternating tiptoe steps, weight shifts, gestures and shot transitions with the musical beat while preserving the ordered visual storyboard and natural movement. Aim for a shared musical pulse rather than forced or unnatural exact beat matching. Do not copy the original melody, lyrics, vocals or sound recording; do not add spoken dialogue. Do not produce a silent output.

## 8. STRICT NEGATIVE CONSTRAINTS

No character swapping. No identity blending. No duplicated characters. No changes to the uploaded people's original clothing, footwear, jewelry, or accessories. No generic dance substitutions. No ordinary walking in place. No running. No jumping. No random choreography. No missing limbs. No extra limbs. No malformed hands. No distorted feet. No fused shoes. No sliding feet. No floating heels. No impossible ankle rotations. No abrupt body-size changes. No flickering faces. No inconsistent hairstyles. No sudden costume changes. No random scene changes. No excessive motion blur. No persistent face-only framing. No cropping out the feet during the main dance. No text overlays. No subtitles. No watermarks.

## 9. FINAL REFERENCE-FIDELITY REQUIREMENT

The uploaded reference video is the primary guide for the recognizable choreography, expression changes, camera rhythm, shot order, and comedic timing. Do not redesign the dance or replace it with a modern routine.

Image 1 must always be the dancer. Image 2 must always be the seated observer.

Prioritize the distinctive bent-knee posture, lifted heels, alternating forefoot steps, outstretched arms, mischievous expression, dedicated footwork close-up, and surprised observer.

The goal is a faithful, recognizable recreation of the classic “Tiptoeing in My Jordans” meme, with the two uploaded people convincingly integrated into the original performance and their appearances preserved throughout.$prompt$)
ON CONFLICT (template_id,scene_id) DO NOTHING;
