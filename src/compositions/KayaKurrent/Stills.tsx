import React from "react";
import { Folder, Still } from "remotion";
import { BREAKING } from "./breaking";
import {
  CELEBRATION_POST_SIZE,
  CELEBRATION_STORY_SIZE,
  CelebrationPost,
  CelebrationStory,
  celebrationSchema,
} from "./Celebration";
import { CELEBRATIONS } from "./celebrations";
import {
  BREAKING_POST_SIZE,
  BREAKING_STORY_SIZE,
  BreakingPost,
  BreakingStory,
  breakingSchema,
} from "./BreakingNews";
import {
  COVER_POST_SIZE,
  COVER_STORY_SIZE,
  CoverPost,
  CoverStory,
  coverSchema,
} from "./Cover";
import { COVERS } from "./covers";
import { NewsPost, POST_SIZE } from "./NewsPost";
import { NOTICES } from "./notices";
import { OPPORTUNITIES } from "./opportunities";
import {
  OPPORTUNITY_POST_SIZE,
  OPPORTUNITY_STORY_SIZE,
  OpportunityPost,
  OpportunityStory,
  opportunitySchema,
} from "./Opportunities";
import {
  NOTICE_POST_SIZE,
  NOTICE_STORY_SIZE,
  NoticePost,
  NoticeStory,
  noticeSchema,
} from "./PublicNotice";
import { NewsStory, STORY_SIZE } from "./NewsStory";
import { kkStorySchema } from "./schema";
import { STORIES } from "./stories";

/**
 * Every Kaya Kurrent template, one sub-folder per template family.
 * Each item becomes KK-<slug>-Post and KK-<slug>-Story (rendered by `npm run kk`);
 * covers become KK-<slug>-Cover-Post and KK-<slug>-Cover-Story.
 */
export const KayaKurrentStills: React.FC = () => (
  <Folder name="KayaKurrent">
    <Folder name="News">
      {STORIES.map(({ slug, ...props }) => (
        <React.Fragment key={slug}>
          <Still
            id={`KK-${slug}-Post`}
            component={NewsPost}
            {...POST_SIZE}
            schema={kkStorySchema}
            defaultProps={props}
          />
          <Still
            id={`KK-${slug}-Story`}
            component={NewsStory}
            {...STORY_SIZE}
            schema={kkStorySchema}
            defaultProps={props}
          />
        </React.Fragment>
      ))}
    </Folder>
    <Folder name="News-Cover">
      {COVERS.map(({ slug, ...props }) => (
        <React.Fragment key={slug}>
          <Still
            id={`KK-${slug}-Cover-Post`}
            component={CoverPost}
            {...COVER_POST_SIZE}
            schema={coverSchema}
            defaultProps={props}
          />
          <Still
            id={`KK-${slug}-Cover-Story`}
            component={CoverStory}
            {...COVER_STORY_SIZE}
            schema={coverSchema}
            defaultProps={props}
          />
        </React.Fragment>
      ))}
    </Folder>
    <Folder name="Breaking-News">
      {BREAKING.map(({ slug, ...props }) => (
        <React.Fragment key={slug}>
          <Still
            id={`KK-${slug}-Post`}
            component={BreakingPost}
            {...BREAKING_POST_SIZE}
            schema={breakingSchema}
            defaultProps={props}
          />
          <Still
            id={`KK-${slug}-Story`}
            component={BreakingStory}
            {...BREAKING_STORY_SIZE}
            schema={breakingSchema}
            defaultProps={props}
          />
        </React.Fragment>
      ))}
    </Folder>
    <Folder name="Public-Notice">
      {NOTICES.map(({ slug, ...props }) => (
        <React.Fragment key={slug}>
          <Still
            id={`KK-${slug}-Post`}
            component={NoticePost}
            {...NOTICE_POST_SIZE}
            schema={noticeSchema}
            defaultProps={props}
          />
          <Still
            id={`KK-${slug}-Story`}
            component={NoticeStory}
            {...NOTICE_STORY_SIZE}
            schema={noticeSchema}
            defaultProps={props}
          />
        </React.Fragment>
      ))}
    </Folder>
    <Folder name="Celebration">
      {CELEBRATIONS.map(({ slug, ...props }) => (
        <React.Fragment key={slug}>
          <Still
            id={`KK-${slug}-Post`}
            component={CelebrationPost}
            {...CELEBRATION_POST_SIZE}
            schema={celebrationSchema}
            defaultProps={props}
          />
          <Still
            id={`KK-${slug}-Story`}
            component={CelebrationStory}
            {...CELEBRATION_STORY_SIZE}
            schema={celebrationSchema}
            defaultProps={props}
          />
        </React.Fragment>
      ))}
    </Folder>
    <Folder name="Opportunities">
      {OPPORTUNITIES.map(({ slug, ...props }) => (
        <React.Fragment key={slug}>
          <Still
            id={`KK-${slug}-Post`}
            component={OpportunityPost}
            {...OPPORTUNITY_POST_SIZE}
            schema={opportunitySchema}
            defaultProps={props}
          />
          <Still
            id={`KK-${slug}-Story`}
            component={OpportunityStory}
            {...OPPORTUNITY_STORY_SIZE}
            schema={opportunitySchema}
            defaultProps={props}
          />
        </React.Fragment>
      ))}
    </Folder>
  </Folder>
);
