import { GraphQLError } from 'graphql';
import bcrypt from 'bcryptjs';
import { Origin, Archetype, Skill, Equipment, Character, User } from '../models/index.js';
import { signToken } from '../auth.js';

export const typeDefs = `#graphql
    type Origin {
        _id: ID!
        race:        String!
        culture:     String!
        description: String

        bodyPoints:  Int
        maxMovement: Int
    }

    type Archetype {
        _id: ID!
        name:        String!
        description: String
        coreSkillNames: [String]
    }

    type Skill {
        _id: ID!
        name:        String!
        category:    String
        description: String
        maxSV:       Int
        disciplines: [Discipline]
    }

    type Discipline {
        name:        String!
        description: String
        specialties: [Specialty]
    }

    type Specialty {
        name:        String!
        description: String
    }

    type Equipment {
        _id: ID!
        name:        String!
        category:    String
        damage:      String
        armor:       Int
        weight:      Float
        cost:        Int
    }

    type CharacterSkill {
        skill:      Skill
        sv:         Int
    }

    type CharacterDiscipline {
        skill:      Skill
        name:       String
        level:      Int
    }

    type CharacterSpecialty {
        skill:      Skill
        discipline: String
        name:       String
        level:      Int
    }

    type CharacterEquipment {
        item:       Equipment
        quantity:   Int
    }

    type Character {
        _id:        ID!
        owner:      User
        archetype:  Archetype
        origin:     Origin
        name:       String!
        age:        Int
        height:     Float
        weight:     Float
        weaponHand: String
        creationPoints: Int
        traits:     Traits
        skills:      [CharacterSkill]
        disciplines:  [CharacterDiscipline]
        specialties: [CharacterSpecialty]
        equipment:   [CharacterEquipment]
    }

    type Traits {
        charisma:        Int
        constitution:    Int
        dexterity:       Int
        intelligence:    Int
        perception:      Int
        psyche:          Int
        strength:        Int
    }

    type User {
        _id: ID!
        username: String!
        role:     String!
    }

    type AuthPayload {
        token:      String!
        username:   String!
        role:       String!
    }

    # -- Queries --
    type Query {
        # Public / Authenticated
        origins:            [Origin]
        origin(id: ID!):    Origin
        archetypes:         [Archetype]
        archetype(id: ID!): Archetype
        skills:             [Skill]
        skill(id: ID!):     Skill
        equipment:          [Equipment]

        # Authenticated: own data
        myCharacters:       [Character]
        character(id: ID!): Character

        # Admin only
        allCharacters:      [Character]
        allUsers:           [User]
    }

    # -- Mutations --
    type Mutation {
        register(username: String!, password: String!): AuthPayload!
        login(username: String!, password: String!): AuthPayload!

        createCharacter(input: CharacterInput!): Character!
        updateCharacter(id: ID!, input: CharacterInput!): Character!
        deleteCharacter(id: ID!): Boolean!

        # Admin only
        createArchetype(input: ArchetypeInput!): Archetype!
        updateArchetype(id: ID!, input: ArchetypeInput!): Archetype!
        deleteArchetype(id: ID!): Boolean!

        createSkill(input: SkillInput!): Skill!
        updateSkill(id: ID!, input: SkillInput!): Skill!
        deleteSkill(id: ID!): Boolean!
    }

    input CharacterInput {
        archetypeId:        ID!
        originId:           ID!
        name:               String!
        age:                Int
        height:             Float
        weight:             Float
        weaponHand:         String
        creationPoints:     Int
        traits:             TraitsInput!
        skills:             [CharacterSkillInput!]
        disciplines:        [CharacterDisciplineInput!]
        specialties:        [CharacterSpecialtyInput!]
        equipment:          [CharacterEquipmentInput!]
    }

    # Traits: each value in [-4, +4]
    input TraitsInput {
        charisma:       Int!
        constitution:   Int!
        dexterity:      Int!
        intelligence:   Int!
        perception:     Int!
        psyche:         Int!
        strength:       Int!
    }
    input CharacterSkillInput {
        skillId:    ID!
        sv:         Int!
    }
    input CharacterDisciplineInput {
        skillId:    ID!
        name:       String!
        level:      Int!
    }
    input CharacterSpecialtyInput {
        skillId:    ID!
        discipline: String!
        name:       String!
        level:      Int!
    }
    input CharacterEquipmentInput {
        itemId:     ID!
        quantity:   Int
    }
    input ArchetypeInput {
        name:       String!
        description: String
        coreSkillNames: [String]
    }
    input SkillInput {
        name:       String!
        category:   String
        description: String
        maxSV:      Int
    }
`;

// -- Helper guards
function requireAuth(ctx) {
    if (!ctx.user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
}
function requireAdmin(ctx) {
    requireAuth(ctx);
    if (ctx.user.role !== 'admin') throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
}

// -- Resolvers --
export const resolvers = {
    Query: {
        origins:    async () => Origin.find(),
        origin:     async (_, { id }) => Origin.findById(id),
        archetypes:    async () => Archetype.find(),
        archetype:     async (_, { id }) => Archetype.findById(id),
        skills:    async () => Skill.find(),
        skill:     async (_, { id }) => Skill.findById(id),
        equipment:    async () => Equipment.find(),
        myCharacters:    async (_, __, ctx) => { requireAuth(ctx); return Character.find({ owner: ctx.user.sub }).populate('archetype origin skills.skill equipment.item'); },
        character:     async (_, { id }, ctx) => { requireAuth(ctx); return Character.findById(id).populate('archetype origin skills.skill equipment.item'); },
        allCharacters: async (_, __, ctx) => { requireAdmin(ctx); return Character.find().populate('owner archetype origin'); },
        allUsers:   async (_, __, ctx) => { requireAdmin(ctx); return User.find().select('-passwordHash'); }
    },

    Mutation: {
        register: async (_, { username, password }) => {
            const hash = await bcrypt.hash(password, 12);
            const user = new User({ username, passwordHash: hash });
            await user.save();
            return { token: signToken(user), username: user.username, role: user.role };
        },
        login: async (_, { username, password }) => {
            const user = await User.findOne({ username: username.toLowerCase() });
            if (!user || !(await user.comparePassword(password)))
                throw new GraphQLError('Invalid credentials', { extensions: { code: 'UNAUTHENTICATED' } });
            return { token: signToken(user), username: user.username, role: user.role };
        },
        createCharacter: async (_, { input }, ctx) => {
            requireAuth(ctx);
            const char = new Character({
                ...input,
                archetype: input.archetypeId,
                origin: input.originId,
                owner: ctx.user.sub,
                skills: input.skills?.map(s => ({ skill: s.skillId, sv: s.sv })),
                equipment: input.equipment?.map(e => ({ item: e.itemId, quantity: e.quantity ?? 1 }))
            });
            await char.save();
            return char.populate('archetype origin skills.skill equipment.item');
        },
        updateCharacter: async (_, { id, input }, ctx) => {
            requireAuth(ctx);
            return Character.findByIdAndUpdate(id, input, { new: true }).populate('archetype origin skills.skill equipment.item');
        },
        deleteCharacter: async (_, { id }, ctx) => {
            requireAuth(ctx);
            await Character.findByIdAndDelete(id);
            return true;
        },
        createArchetype: async (_, { input }, ctx) => {
            requireAdmin(ctx);
            const a = new Archetype(input);
            await a.save();
            return a;
        },
        updateArchetype: async (_, { id, input }, ctx) => {
            requireAdmin(ctx);
            return Archetype.findByIdAndUpdate(id, input, { new: true });
        },
        deleteArchetype: async (_, { id }, ctx) => {
            requireAdmin(ctx);
            await Archetype.findByIdAndDelete(id);
            return true;
        },
        createSkill: async (_, { input }, ctx) => {
            requireAdmin(ctx);
            const s = new Skill(input);
            await s.save();
            return s;
        },
        updateSkill: async (_, { id, input }, ctx) => {
            requireAdmin(ctx);
            return Skill.findByIdAndUpdate(id, input, { new: true });
        },
        deleteSkill: async (_, { id }, ctx) => {
            requireAdmin(ctx);
            await Skill.findByIdAndDelete(id);
            return true;
        }
    }
};