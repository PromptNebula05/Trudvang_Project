import { gql } from '@apollo/client';

export const GET_ORIGINS = gql`
  query { origins { _id race culture description bodyPoints maxMovement } }
`;

export const GET_ARCHETYPES = gql`
  query { archetypes { _id name description coreSkillNames } }
`;

export const GET_SKILLS = gql`
  query { skills { _id name category description
    disciplines { name description specialties { name description } } } }
`;

export const GET_EQUIPMENT = gql`
  query { equipment { _id name category damage armor cost } }
`;

export const MY_CHARACTERS = gql`
  query { myCharacters { _id name age height weight weaponHand creationPoints
    archetype { _id name coreSkillNames }
    origin { _id race culture bodyPoints maxMovement }
    traits { charisma constitution dexterity intelligence perception psyche strength }
    skills { skill { _id name category } sv }
    disciplines { skill { _id name } name level }
    specialties { skill { _id name } discipline name level }
    equipment { item { _id name category } quantity } } }
`;

export const GET_CHARACTER = gql`
  query GetCharacter($id: ID!) { character(id: $id) { _id name age creationPoints
    archetype { _id name } origin { _id race culture }
    traits { charisma constitution dexterity intelligence perception psyche strength }
    skills { skill { _id name } sv }
    disciplines { name level }
    specialties { discipline name level }
    equipment { item { _id name } quantity } } }
`;

export const ALL_USERS = gql`
  query { allUsers { _id username role } }
`;

export const CREATE_CHARACTER = gql`
  mutation CreateCharacter($input: CharacterInput!) {
    createCharacter(input: $input) { _id name } }
`;

export const DELETE_CHARACTER = gql`
  mutation DeleteCharacter($id: ID!) { deleteCharacter(id: $id) }
`;

export const CREATE_ARCHETYPE = gql`
  mutation CreateArchetype($input: ArchetypeInput!) {
    createArchetype(input: $input) { _id name } }
`;

export const UPDATE_ARCHETYPE = gql`
  mutation UpdateArchetype($id: ID!, $input: ArchetypeInput!) {
    updateArchetype(id: $id, input: $input) { _id name } }
`;

export const DELETE_ARCHETYPE = gql`
  mutation DeleteArchetype($id: ID!) { deleteArchetype(id: $id) }
`;

export const CREATE_SKILL = gql`
  mutation CreateSkill($input: SkillInput!) {
    createSkill(input: $input) { _id name } }
`;

export const UPDATE_SKILL = gql`
  mutation UpdateSkill($id: ID!, $input: SkillInput!) {
    updateSkill(id: $id, input: $input) { _id name } }
`;

export const DELETE_SKILL = gql`
  mutation DeleteSkill($id: ID!) { deleteSkill(id: $id) }
`;