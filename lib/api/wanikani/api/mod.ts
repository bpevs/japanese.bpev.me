import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core'
import { z } from 'zod'

const SubjectType = z.enum(['kanji', 'radical', 'vocabulary'])
const CollectionObjectType = z.enum(['collection', 'report'])
const BaseCollection = z
  .object({
    object: CollectionObjectType,
    url: z.string(),
    pages: z
      .object({
        next_url: z.string().nullable(),
        previous_url: z.string().nullable(),
        per_page: z.number().int(),
      })
      .passthrough(),
    total_count: z.number().int(),
    data_updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough()
const ResourceObjectType = z.enum([
  'assignment',
  'kanji',
  'level_progression',
  'radical',
  'reset',
  'review_statistic',
  'review',
  'spaced_repetition_system',
  'study_material',
  'user',
  'vocabulary',
])
const BaseResource = z
  .object({
    id: z.number().int().optional(),
    object: ResourceObjectType,
    url: z.string(),
    data_updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough()
const Assignment = BaseResource.and(
  z
    .object({
      data: z
        .object({
          available_at: z.string().datetime({ offset: true }).nullable(),
          burned_at: z.string().datetime({ offset: true }).nullable(),
          created_at: z.string().datetime({ offset: true }),
          hidden: z.boolean(),
          passed_at: z.string().datetime({ offset: true }).nullable(),
          resurrected_at: z.string().datetime({ offset: true }).nullable(),
          srs_stage: z.number().int(),
          started_at: z.string().datetime({ offset: true }).nullable(),
          subject_id: z.number().int(),
          subject_type: SubjectType,
          unlocked_at: z.string().datetime({ offset: true }).nullable(),
        })
        .passthrough(),
    })
    .passthrough(),
)
const Assignments = BaseCollection.and(
  z.object({ data: z.array(Assignment) }).passthrough(),
)
const BaseError = z
  .object({ error: z.string(), code: z.number().int() })
  .passthrough()
const StartAssignmentRequest = z
  .object({ started_at: z.string().datetime({ offset: true }) })
  .partial()
  .passthrough()
const LevelProgression = BaseResource.and(
  z
    .object({
      data: z
        .object({
          abandoned_at: z.string().datetime({ offset: true }).nullable(),
          completed_at: z.string().datetime({ offset: true }).nullable(),
          created_at: z.string().datetime({ offset: true }),
          level: z.number().int(),
          passed_at: z.string().datetime({ offset: true }).nullable(),
          started_at: z.string().datetime({ offset: true }).nullable(),
          unlocked_at: z.string().datetime({ offset: true }).nullable(),
        })
        .passthrough(),
    })
    .passthrough(),
)
const LevelProgressions = BaseCollection.and(
  z.object({ data: z.array(LevelProgression) }).passthrough(),
)
const Reset = BaseResource.and(
  z
    .object({
      data: z
        .object({
          confirmed_at: z.string().datetime({ offset: true }).nullable(),
          created_at: z.string().datetime({ offset: true }),
          original_level: z.number().int(),
          target_level: z.number().int(),
        })
        .passthrough(),
    })
    .passthrough(),
)
const Resets = BaseCollection.and(
  z.object({ data: z.array(Reset) }).passthrough(),
)
const Review = BaseResource.and(
  z
    .object({
      data: z
        .object({
          assignment_id: z.number().int(),
          created_at: z.string().datetime({ offset: true }),
          ending_srs_stage: z.number().int(),
          incorrect_meaning_answers: z.number().int(),
          incorrect_reading_answers: z.number().int(),
          spaced_repetition_system_id: z.number().int(),
          starting_srs_stage: z.number().int(),
          subject_id: z.number().int(),
        })
        .passthrough(),
    })
    .passthrough(),
)
const Reviews = BaseCollection.and(
  z.object({ data: z.array(Review) }).passthrough(),
)
const CreateReview = z
  .object({
    assignment_id: z.number().int(),
    created_at: z.string().datetime({ offset: true }).optional(),
    ending_srs_stage: z.number().int().optional(),
    incorrect_meaning_answers: z.number().int(),
    incorrect_reading_answers: z.number().int(),
    spaced_repetition_system_id: z.number().int().optional(),
    starting_srs_stage: z.number().int().optional(),
    subject_id: z.number().int(),
  })
  .passthrough()
const CreateReviewRequest = z
  .object({ review: CreateReview })
  .partial()
  .passthrough()
const ReviewStatistic = BaseResource.and(
  z
    .object({
      data: z
        .object({
          created_at: z.string().datetime({ offset: true }),
          hidden: z.boolean(),
          meaning_correct: z.number().int(),
          meaning_current_streak: z.number().int(),
          meaning_incorrect: z.number().int(),
          meaning_max_streak: z.number().int(),
          percentage_correct: z.number().int(),
          reading_correct: z.number().int(),
          reading_current_streak: z.number().int(),
          reading_incorrect: z.number().int(),
          reading_max_streak: z.number().int(),
          subject_id: z.number().int(),
          subject_type: SubjectType,
        })
        .passthrough(),
    })
    .passthrough(),
)
const CreateReviewResponse = BaseResource.and(
  z
    .object({
      data: CreateReview,
      resources_updated: z
        .object({ assignment: Assignment, review_statistic: ReviewStatistic })
        .passthrough(),
    })
    .passthrough(),
)
const ReviewStatistics = BaseCollection.and(
  z.object({ data: z.array(ReviewStatistic) }).passthrough(),
)
const StageAttributes = z
  .object({
    interval: z.number().int().nullable(),
    interval_unit: z
      .enum(['milliseconds', 'seconds', 'minutes', 'hours', 'days', 'weeks'])
      .nullable(),
    position: z.number().int(),
  })
  .passthrough()
const SpacedRepetitionSystem = BaseResource.and(
  z
    .object({
      data: z
        .object({
          burning_stage_position: z.number().int(),
          created_at: z.string().datetime({ offset: true }),
          description: z.string(),
          name: z.string(),
          passing_stage_position: z.number().int(),
          stages: z.array(StageAttributes),
          starting_stage_position: z.number().int(),
          unlocking_stage_position: z.number().int(),
        })
        .passthrough(),
    })
    .passthrough(),
)
const SpacedRepetitionSystems = BaseCollection.and(
  z.object({ data: z.array(SpacedRepetitionSystem) }).passthrough(),
)
const StudyMaterial = BaseResource.and(
  z
    .object({
      data: z
        .object({
          created_at: z.string().datetime({ offset: true }),
          hidden: z.boolean(),
          meaning_note: z.string().nullable(),
          meaning_synonyms: z.array(z.string()),
          reading_note: z.string().nullable(),
          subject_id: z.number().int(),
          subject_type: SubjectType,
        })
        .passthrough(),
    })
    .passthrough(),
)
const StudyMaterials = BaseCollection.and(
  z.object({ data: z.array(StudyMaterial) }).passthrough(),
)
const AuxiliaryMeaning = z
  .object({ meaning: z.string(), type: z.string() })
  .passthrough()
const Meaning = z
  .object({
    meaning: z.string(),
    primary: z.boolean(),
    accepted_answer: z.boolean(),
  })
  .passthrough()
const CommonSubject = z
  .object({
    auxiliary_meanings: z.array(AuxiliaryMeaning),
    characters: z.string(),
    created_at: z.string().datetime({ offset: true }),
    document_url: z.string(),
    hidden_at: z.string().datetime({ offset: true }).nullable(),
    lesson_position: z.number().int(),
    level: z.number().int(),
    meaning_mnemonic: z.string(),
    meanings: z.array(Meaning),
    slug: z.string(),
    spaced_repetition_system_id: z.number().int(),
  })
  .passthrough()
const ImagePngMetadata = z
  .object({ color: z.string(), dimensions: z.string(), style_name: z.string() })
  .passthrough()
const ImageSvgMetadata = z.object({ inline_styles: z.boolean() }).passthrough()
const RadicalCharacterImage = z
  .object({
    url: z.string(),
    content_type: z.string(),
    metadata: z.union([ImagePngMetadata, ImageSvgMetadata]),
  })
  .passthrough()
const RadicalSubject = CommonSubject.and(
  z
    .object({
      amalgamation_subject_ids: z.array(z.number().int()),
      characters: z.string().nullable(),
      character_images: z.array(RadicalCharacterImage),
    })
    .passthrough(),
)
const BaseReading = z
  .object({
    reading: z.string(),
    primary: z.boolean(),
    accepted_answer: z.boolean(),
  })
  .passthrough()
const KanjiReading = BaseReading.and(
  z.object({ type: z.enum(['kunyomi', 'nanori', 'onyomi']) }).passthrough(),
)
const KanjiSubject = CommonSubject.and(
  z
    .object({
      amalgamation_subject_ids: z.array(z.number().int()),
      component_subject_ids: z.array(z.number().int()),
      meaning_hint: z.string().nullable(),
      reading_hint: z.string().nullable(),
      reading_mnemonic: z.string(),
      readings: z.array(KanjiReading),
      visually_similar_subject_ids: z.array(z.number().int()),
    })
    .passthrough(),
)
const ContextSentence = z
  .object({ en: z.string(), ja: z.string() })
  .passthrough()
const PronunciationAudio = z
  .object({
    url: z.string(),
    content_type: z.string(),
    metadata: z
      .object({
        gender: z.string(),
        source_id: z.number().int(),
        pronunciation: z.string(),
        voice_actor_id: z.number().int(),
        voice_actor_name: z.string(),
        voice_description: z.string(),
      })
      .passthrough(),
  })
  .passthrough()
const VocabSubject = CommonSubject.and(
  z
    .object({
      component_subject_ids: z.array(z.number().int()),
      context_sentences: z.array(ContextSentence),
      meaning_mnemonic: z.string(),
      parts_of_speech: z.array(z.string()),
      pronunciation_audios: z.array(PronunciationAudio),
      readings: z.array(BaseReading),
      reading_mnemonic: z.string(),
    })
    .passthrough(),
)
const Subject = BaseResource.and(
  z
    .object({ data: z.union([RadicalSubject, KanjiSubject, VocabSubject]) })
    .passthrough(),
)
const Subjects = BaseCollection.and(
  z.object({ data: z.array(Subject) }).passthrough(),
)
const SummaryLessons = z
  .object({
    available_at: z.string().datetime({ offset: true }),
    subject_ids: z.array(z.number().int()),
  })
  .passthrough()
const SummaryReviews = z
  .object({
    available_at: z.string().datetime({ offset: true }),
    subject_ids: z.array(z.number().int()),
  })
  .passthrough()
const Summary = BaseResource.and(
  z
    .object({
      data: z
        .object({
          lessons: z.array(SummaryLessons),
          next_reviews_at: z.string().datetime({ offset: true }).nullable(),
          reviews: z.array(SummaryReviews),
        })
        .passthrough(),
    })
    .passthrough(),
)
const UserPreferences = z
  .object({
    default_voice_actor_id: z.number().int(),
    lessons_autoplay_audio: z.boolean(),
    lessons_batch_size: z.number().int(),
    lessons_presentation_order: z.enum([
      'ascending_level_then_subject',
      'shuffled',
      'ascending_level_then_shuffled',
    ]),
    reviews_autoplay_audio: z.boolean(),
    reviews_display_srs_indicator: z.boolean(),
  })
  .passthrough()
const UserSubscription = z
  .object({
    active: z.boolean(),
    max_level_granted: z.number().int(),
    period_ends_at: z.string().datetime({ offset: true }).nullable(),
    type: z.enum(['free', 'recurring', 'lifetime']),
  })
  .passthrough()
const User = BaseResource.and(
  z
    .object({
      data: z
        .object({
          current_vacation_started_at: z
            .string()
            .datetime({ offset: true })
            .nullable(),
          level: z.number().int(),
          preferences: UserPreferences,
          profile_url: z.string(),
          started_at: z.string().datetime({ offset: true }),
          subscription: UserSubscription,
          username: z.string(),
        })
        .passthrough(),
    })
    .passthrough(),
)
const VoiceActor = BaseResource.and(
  z
    .object({
      data: z
        .object({
          description: z.string(),
          gender: z.string(),
          name: z.string(),
        })
        .passthrough(),
    })
    .passthrough(),
)
const VoiceActors = BaseCollection.and(
  z.object({ data: z.array(VoiceActor) }).passthrough(),
)

export const schemas = {
  SubjectType,
  CollectionObjectType,
  BaseCollection,
  ResourceObjectType,
  BaseResource,
  Assignment,
  Assignments,
  BaseError,
  StartAssignmentRequest,
  LevelProgression,
  LevelProgressions,
  Reset,
  Resets,
  Review,
  Reviews,
  CreateReview,
  CreateReviewRequest,
  ReviewStatistic,
  CreateReviewResponse,
  ReviewStatistics,
  StageAttributes,
  SpacedRepetitionSystem,
  SpacedRepetitionSystems,
  StudyMaterial,
  StudyMaterials,
  AuxiliaryMeaning,
  Meaning,
  CommonSubject,
  ImagePngMetadata,
  ImageSvgMetadata,
  RadicalCharacterImage,
  RadicalSubject,
  BaseReading,
  KanjiReading,
  KanjiSubject,
  ContextSentence,
  PronunciationAudio,
  VocabSubject,
  Subject,
  Subjects,
  SummaryLessons,
  SummaryReviews,
  Summary,
  UserPreferences,
  UserSubscription,
  User,
  VoiceActor,
  VoiceActors,
}

const endpoints = makeApi([
  {
    method: 'get',
    path: '/assignments',
    alias: 'getAssignments',
    description: `Returns a collection of all assignments, ordered by ascending created_at, 500 at a time.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'available_after',
        type: 'Query',
        schema: z.string().datetime({ offset: true }).optional(),
      },
      {
        name: 'available_before',
        type: 'Query',
        schema: z.string().datetime({ offset: true }).optional(),
      },
      {
        name: 'burned',
        type: 'Query',
        schema: z.boolean().optional(),
      },
      {
        name: 'hidden',
        type: 'Query',
        schema: z.boolean().optional(),
      },
      {
        name: 'ids',
        type: 'Query',
        schema: z.array(z.number().int()).optional(),
      },
      {
        name: 'immediately_available_for_lessons',
        type: 'Query',
        schema: z.boolean().optional(),
      },
      {
        name: 'immediately_available_for_review',
        type: 'Query',
        schema: z.boolean().optional(),
      },
      {
        name: 'in_review',
        type: 'Query',
        schema: z.boolean().optional(),
      },
      {
        name: 'levels',
        type: 'Query',
        schema: z.array(z.number().int()).optional(),
      },
      {
        name: 'srs_stages',
        type: 'Query',
        schema: z.array(z.number().int()).optional(),
      },
      {
        name: 'started',
        type: 'Query',
        schema: z.boolean().optional(),
      },
      {
        name: 'subject_ids',
        type: 'Query',
        schema: z.array(z.number().int()).optional(),
      },
      {
        name: 'subject_types',
        type: 'Query',
        schema: z.array(SubjectType).optional(),
      },
      {
        name: 'unlocked',
        type: 'Query',
        schema: z.boolean().optional(),
      },
      {
        name: 'updated_after',
        type: 'Query',
        schema: z.string().datetime({ offset: true }).optional(),
      },
    ],
    response: Assignments,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: BaseError,
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Resource not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Unprocessable Entity`,
        schema: BaseError,
      },
      {
        status: 429,
        description: `Too Many Requests`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Service Unavailable`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/assignments/:id',
    alias: 'getAssignment',
    description: `Retrieves a specific assignment by its id.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: Assignment,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: BaseError,
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Resource not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Unprocessable Entity`,
        schema: BaseError,
      },
      {
        status: 429,
        description: `Too Many Requests`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Service Unavailable`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'put',
    path: '/assignments/:id/start',
    alias: 'startAssignment',
    description:
      `Mark the assignment as started, moving the assignment from the lessons queue to the review queue. Returns the updated assignment.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z
          .object({ started_at: z.string().datetime({ offset: true }) })
          .partial()
          .passthrough(),
      },
      {
        name: 'id',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: Assignment,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: BaseError,
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Resource not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Unprocessable Entity`,
        schema: BaseError,
      },
      {
        status: 429,
        description: `Too Many Requests`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Service Unavailable`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/level_progressions',
    alias: 'getLevelProgressions',
    description: `Returns a collection of all level progressions, ordered by ascending created_at, 500 at a time.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'ids',
        type: 'Query',
        schema: z.array(z.number().int()).optional(),
      },
      {
        name: 'updated_after',
        type: 'Query',
        schema: z.string().datetime({ offset: true }).optional(),
      },
    ],
    response: LevelProgressions,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: BaseError,
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Resource not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Unprocessable Entity`,
        schema: BaseError,
      },
      {
        status: 429,
        description: `Too Many Requests`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Service Unavailable`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/level_progressions/:id',
    alias: 'getLevelProgression',
    description: `Retrieves a specific level progression by its id.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: LevelProgression,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: BaseError,
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Resource not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Unprocessable Entity`,
        schema: BaseError,
      },
      {
        status: 429,
        description: `Too Many Requests`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Service Unavailable`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/resets',
    alias: 'getResets',
    description: `Returns a collection of all resets, ordered by ascending created_at, 500 at a time.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'ids',
        type: 'Query',
        schema: z.array(z.number().int()).optional(),
      },
      {
        name: 'updated_after',
        type: 'Query',
        schema: z.string().datetime({ offset: true }).optional(),
      },
    ],
    response: Resets,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: BaseError,
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Resource not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Unprocessable Entity`,
        schema: BaseError,
      },
      {
        status: 429,
        description: `Too Many Requests`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Service Unavailable`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/resets/:id',
    alias: 'getReset',
    description: `Retrieves a specific reset by its id.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: Reset,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: BaseError,
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Resource not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Unprocessable Entity`,
        schema: BaseError,
      },
      {
        status: 429,
        description: `Too Many Requests`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Service Unavailable`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/review_statistics',
    alias: 'getReviewStatistics',
    description: `Returns a collection of all review statistics, ordered by ascending created_at, 500 at a time.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'ids',
        type: 'Query',
        schema: z.array(z.number().int()).optional(),
      },
      {
        name: 'updated_after',
        type: 'Query',
        schema: z.string().datetime({ offset: true }).optional(),
      },
      {
        name: 'hidden',
        type: 'Query',
        schema: z.boolean().optional(),
      },
      {
        name: 'subject_ids',
        type: 'Query',
        schema: z.array(z.number().int()).optional(),
      },
      {
        name: 'subject_types',
        type: 'Query',
        schema: z.array(SubjectType).optional(),
      },
      {
        name: 'percentages_greater_than',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'percentages_less_than',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: ReviewStatistics,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: BaseError,
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Resource not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Unprocessable Entity`,
        schema: BaseError,
      },
      {
        status: 429,
        description: `Too Many Requests`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Service Unavailable`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/review_statistics/:id',
    alias: 'getReviewStatistic',
    description: `Retrieves a specific review statistic by its id.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: ReviewStatistic,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: BaseError,
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Resource not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Unprocessable Entity`,
        schema: BaseError,
      },
      {
        status: 429,
        description: `Too Many Requests`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Service Unavailable`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/reviews',
    alias: 'getReviews',
    description: `Returns a collection of all reviews, ordered by ascending created_at, 500 at a time.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'ids',
        type: 'Query',
        schema: z.array(z.number().int()).optional(),
      },
      {
        name: 'updated_after',
        type: 'Query',
        schema: z.string().datetime({ offset: true }).optional(),
      },
      {
        name: 'assignment_ids',
        type: 'Query',
        schema: z.array(z.number().int()).optional(),
      },
      {
        name: 'subject_ids',
        type: 'Query',
        schema: z.array(z.number().int()).optional(),
      },
    ],
    response: Reviews,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: BaseError,
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Resource not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Unprocessable Entity`,
        schema: BaseError,
      },
      {
        status: 429,
        description: `Too Many Requests`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Service Unavailable`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/reviews',
    alias: 'createReview',
    description:
      `Creates a review for a specific assignment_id. Using the related subject_id is also a valid alternative to using assignment_id.

Some criteria must be met in order for a review to be created: available_at must be not null and in the past.

When a review is registered, the associated assignment and review_statistic are both updated. These are returned in the response body under resources_updated.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: CreateReviewRequest,
      },
    ],
    response: CreateReviewResponse,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: BaseError,
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Resource not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Unprocessable Entity`,
        schema: BaseError,
      },
      {
        status: 429,
        description: `Too Many Requests`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Service Unavailable`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/reviews/:id',
    alias: 'getReview',
    description: `Retrieves a specific review by its id.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: Review,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: BaseError,
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Resource not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Unprocessable Entity`,
        schema: BaseError,
      },
      {
        status: 429,
        description: `Too Many Requests`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Service Unavailable`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/spaced_repetition_systems',
    alias: 'getSpacedRepetitionSystems',
    description:
      `Returns a collection of all spaced repetition systems, ordered by ascending created_at, 500 at a time.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'hidden',
        type: 'Query',
        schema: z.boolean().optional(),
      },
      {
        name: 'ids',
        type: 'Query',
        schema: z.array(z.number().int()).optional(),
      },
      {
        name: 'updated_after',
        type: 'Query',
        schema: z.string().datetime({ offset: true }).optional(),
      },
      {
        name: 'subject_ids',
        type: 'Query',
        schema: z.array(z.number().int()).optional(),
      },
      {
        name: 'subject_types',
        type: 'Query',
        schema: z.array(SubjectType).optional(),
      },
    ],
    response: SpacedRepetitionSystems,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: BaseError,
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Resource not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Unprocessable Entity`,
        schema: BaseError,
      },
      {
        status: 429,
        description: `Too Many Requests`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Service Unavailable`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/spaced_repetition_systems/:id',
    alias: 'getSpacedRepetitionSystem',
    description: `Retrieves a specific spaced repetition system by its id.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: SpacedRepetitionSystem,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: BaseError,
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Resource not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Unprocessable Entity`,
        schema: BaseError,
      },
      {
        status: 429,
        description: `Too Many Requests`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Service Unavailable`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/study_materials',
    alias: 'getStudyMaterials',
    description: `Returns a collection of all study material, ordered by ascending created_at, 500 at a time.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'ids',
        type: 'Query',
        schema: z.array(z.number().int()).optional(),
      },
      {
        name: 'updated_after',
        type: 'Query',
        schema: z.string().datetime({ offset: true }).optional(),
      },
    ],
    response: StudyMaterials,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: BaseError,
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Resource not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Unprocessable Entity`,
        schema: BaseError,
      },
      {
        status: 429,
        description: `Too Many Requests`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Service Unavailable`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/study_materials/:id',
    alias: 'getStudyMaterial',
    description: `Retrieves a specific study material by its id.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: StudyMaterial,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: BaseError,
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Resource not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Unprocessable Entity`,
        schema: BaseError,
      },
      {
        status: 429,
        description: `Too Many Requests`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Service Unavailable`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/subjects',
    alias: 'getSubjects',
    description: `Returns a collection of all subjects, ordered by ascending created_at, 500 at a time.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'ids',
        type: 'Query',
        schema: z.array(z.number().int()).optional(),
      },
      {
        name: 'types',
        type: 'Query',
        schema: z.array(SubjectType).optional(),
      },
      {
        name: 'slugs',
        type: 'Query',
        schema: z.array(z.string()).optional(),
      },
      {
        name: 'levels',
        type: 'Query',
        schema: z.array(z.number().int()).optional(),
      },
      {
        name: 'hidden',
        type: 'Query',
        schema: z.boolean().optional(),
      },
      {
        name: 'updated_after',
        type: 'Query',
        schema: z.string().datetime({ offset: true }).optional(),
      },
    ],
    response: Subjects,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: BaseError,
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Resource not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Unprocessable Entity`,
        schema: BaseError,
      },
      {
        status: 429,
        description: `Too Many Requests`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Service Unavailable`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/subjects/:id',
    alias: 'getSubject',
    description:
      `Retrieves a specific subject by its id. The structure of the response depends on the subject type. See the section on subject data structure for details.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: Subject,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: BaseError,
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Resource not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Unprocessable Entity`,
        schema: BaseError,
      },
      {
        status: 429,
        description: `Too Many Requests`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Service Unavailable`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/summary',
    alias: 'getSummary',
    description: `Retrieves a summary report.`,
    requestFormat: 'json',
    response: Summary,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: BaseError,
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Resource not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Unprocessable Entity`,
        schema: BaseError,
      },
      {
        status: 429,
        description: `Too Many Requests`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Service Unavailable`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/user',
    alias: 'getUser',
    description: `Returns a summary of user information.`,
    requestFormat: 'json',
    response: User,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: BaseError,
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Resource not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Unprocessable Entity`,
        schema: BaseError,
      },
      {
        status: 429,
        description: `Too Many Requests`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Service Unavailable`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/voice_actors',
    alias: 'getVoiceActors',
    description: `Returns a collection of all voice actors, ordered by ascending created_at, 500 at a time.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'ids',
        type: 'Query',
        schema: z.array(z.number().int()).optional(),
      },
      {
        name: 'updated_after',
        type: 'Query',
        schema: z.string().datetime({ offset: true }).optional(),
      },
    ],
    response: VoiceActors,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: BaseError,
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Resource not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Unprocessable Entity`,
        schema: BaseError,
      },
      {
        status: 429,
        description: `Too Many Requests`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Service Unavailable`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/voice_actors/:id',
    alias: 'getVoiceActor',
    description: `Retrieves a specific voice actor by its id.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: VoiceActor,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: BaseError,
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Resource not found`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Unprocessable Entity`,
        schema: BaseError,
      },
      {
        status: 429,
        description: `Too Many Requests`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Service Unavailable`,
        schema: z.void(),
      },
    ],
  },
])

export const api = new Zodios(endpoints)

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options)
}
