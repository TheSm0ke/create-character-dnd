// Run with:
// mongosh "mongodb://127.0.0.1:27017/dnd_su" scripts/migrations/create-characters-collection.mongosh.js
//
// The backend must convert IDs received from the frontend into ObjectId values
// before insert. This migration can be run repeatedly without data loss.

const DATABASE_NAME = 'dnd_su';
const COLLECTION_NAME = 'characters';

const database = db.getSiblingDB(DATABASE_NAME);
const exists = database.getCollectionInfos({ name: COLLECTION_NAME }).length > 0;

const abilityScoreSchema = {
  bsonType: 'object',
  required: ['str', 'dex', 'con', 'int', 'wis', 'cha'],
  properties: {
    str: { bsonType: 'number', minimum: 1, maximum: 30 },
    dex: { bsonType: 'number', minimum: 1, maximum: 30 },
    con: { bsonType: 'number', minimum: 1, maximum: 30 },
    int: { bsonType: 'number', minimum: 1, maximum: 30 },
    wis: { bsonType: 'number', minimum: 1, maximum: 30 },
    cha: { bsonType: 'number', minimum: 1, maximum: 30 },
  },
};

const validator = {
  $jsonSchema: {
    bsonType: 'object',
    required: [
      'name',
      'level',
      'hit_points',
      'race_id',
      'class_id',
      'background_id',
      'alignment_id',
      'ability_scores',
      'skills',
      'personality',
      'inventory',
      'spells',
      'created_at',
      'updated_at',
    ],
    properties: {
      name: { bsonType: 'string', minLength: 1, maxLength: 120 },
      level: { bsonType: 'number', minimum: 1, maximum: 20 },
      experience: { bsonType: 'number', minimum: 0 },
      feat_ids: { bsonType: 'array', items: { bsonType: 'objectId' } },
      hit_points: {
        bsonType: 'object',
        required: ['current', 'maximum'],
        properties: {
          current: { bsonType: 'number', minimum: 0 },
          maximum: { bsonType: 'number', minimum: 1 },
        },
      },
      race_id: { bsonType: 'objectId' },
      class_id: { bsonType: 'objectId' },
      subclass_id: { bsonType: 'string' },
      background_id: { bsonType: 'objectId' },
      alignment_id: { bsonType: 'objectId' },
      ability_scores: {
        bsonType: 'object',
        required: ['base', 'total'],
        properties: {
          base: abilityScoreSchema,
          total: abilityScoreSchema,
        },
      },
      skills: {
        bsonType: 'object',
        required: ['selected', 'granted_by_race', 'granted_by_background'],
        properties: {
          selected: { bsonType: 'array', items: { bsonType: 'string' } },
          granted_by_race: { bsonType: 'array', items: { bsonType: 'string' } },
          granted_by_background: { bsonType: 'array', items: { bsonType: 'string' } },
        },
      },
      background_language_choices: {
        bsonType: 'array',
        items: { bsonType: 'string' },
      },
      personality: {
        bsonType: 'object',
        required: ['traits', 'ideals', 'bonds', 'flaws'],
        properties: {
          traits: { bsonType: 'array', items: { bsonType: 'string' } },
          ideals: { bsonType: 'array', items: { bsonType: 'string' } },
          bonds: { bsonType: 'array', items: { bsonType: 'string' } },
          flaws: { bsonType: 'array', items: { bsonType: 'string' } },
        },
      },
      inventory: {
        bsonType: 'object',
        required: ['fixed_equipment', 'selected_equipment', 'instruments'],
        properties: {
          fixed_equipment: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              required: ['name', 'count'],
              properties: {
                name: { bsonType: 'string' },
                count: { bsonType: 'number', minimum: 1 },
              },
            },
          },
          selected_equipment: {
            bsonType: 'array',
            items: { bsonType: 'array', items: { bsonType: 'string' } },
          },
          instruments: { bsonType: 'array', items: { bsonType: 'string' } },
          custom_equipment: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              required: ['name', 'count'],
              properties: {
                name: { bsonType: 'string' },
                count: { bsonType: 'number', minimum: 1 },
              },
            },
          },
          removed_equipment: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              required: ['name', 'count'],
              properties: {
                name: { bsonType: 'string' },
                count: { bsonType: 'number', minimum: 1 },
              },
            },
          },
        },
      },
      spells: {
        bsonType: 'object',
        required: ['cantrip_ids', 'spell_ids'],
        properties: {
          cantrip_ids: { bsonType: 'array', items: { bsonType: 'objectId' } },
          spell_ids: { bsonType: 'array', items: { bsonType: 'objectId' } },
        },
      },
      created_at: { bsonType: 'date' },
      updated_at: { bsonType: 'date' },
    },
  },
};

if (!exists) {
  database.createCollection(COLLECTION_NAME, {
    validator,
    validationLevel: 'strict',
    validationAction: 'error',
  });
  print(`Collection ${DATABASE_NAME}.${COLLECTION_NAME} created.`);
} else {
  database.runCommand({
    collMod: COLLECTION_NAME,
    validator,
    validationLevel: 'strict',
    validationAction: 'error',
  });
  print(`Validator for ${DATABASE_NAME}.${COLLECTION_NAME} updated.`);
}

const collection = database.getCollection(COLLECTION_NAME);
collection.createIndex({ name: 1 });
collection.createIndex({ created_at: -1 });
collection.createIndex({ race_id: 1, class_id: 1 });

printjson({ collection: COLLECTION_NAME, indexes: collection.getIndexes() });
