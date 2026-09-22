import mongoose, { Schema, type Model, type InferSchemaType } from 'mongoose';

/**
 * A singleton: the Our Story section is one piece of content, not a list.
 *
 * `singleton` is a constant discriminator with a unique index, so an upsert
 * filtered on it can only ever create or update one document — there is no way
 * to end up with two competing story records, even under a concurrent write.
 */
const storyImageSchema = new Schema(
  {
    url: { type: String, required: true, default: '', trim: true },
    alt: { type: String, required: true, default: '', trim: true },
  },
  { _id: false },
);

const storySchema = new Schema(
  {
    singleton: { type: String, required: true, unique: true, default: 'story' },
    primary: { type: storyImageSchema, required: true, default: () => ({ url: '', alt: '' }) },
    secondary: { type: storyImageSchema, required: true, default: () => ({ url: '', alt: '' }) },
  },
  { timestamps: true },
);

export type StoryDoc = InferSchemaType<typeof storySchema>;

const Story =
  (mongoose.models.Story as Model<StoryDoc>) ||
  mongoose.model<StoryDoc>('Story', storySchema);

export const STORY_SINGLETON = 'story';
export default Story;
