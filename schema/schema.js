import { 
    GraphQLID,
    GraphQLList,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString
} from 'graphql';

import Project from '../models/Project.js';
import Client from '../models/Client.js';

const ProjectType = new GraphQLObjectType({
    name: 'Project',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        status: { type: GraphQLString },
        client: {
            type: ClientType,
            resolve: async (parent) => {
                return await Client.findById(parent.clientId);
            }
        }
    })
})

const ClientType = new GraphQLObjectType({
    name: 'Client',
    fields: () => ({
        id:     { type: GraphQLID },
        name:   { type: GraphQLString },
        email:  { type: GraphQLString },
        phone:  { type: GraphQLString }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        projects: {
            type: new GraphQLList(ProjectType),
            resolve: async () => {
                return await Project.find();
            }
        },
        project: {
            type: ProjectType,
            args: {
                id: { type: GraphQLID }
            },
            resolve: async (_parent, args) => {
                return await Project.findById(args.id);
            }
        },
        clients: {
            type: new GraphQLList(ClientType),
            resolve: async () => {
                return await Client.find();
            }
        },
        client: {
            type: ClientType,
            args: {
                id: { type: GraphQLID }
            },
            resolve: async (_parent, args) => {
                return await Client.findById(args.id);
            }
        }
    }
});

const schema = new GraphQLSchema({
    query: RootQuery
});

export default schema;