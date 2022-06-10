import {
    GraphQLEnumType,
    GraphQLID,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString
} from 'graphql';

import Project from '../models/Project.js';
import Client from '../models/Client.js';

const ProjectStatusEnum = new GraphQLEnumType({
    name: 'ProjectStatus',
    values: {
        new: { value: 'Not Started'},
        inprogress: { value: 'In Progress' },
        complete: { value: 'Completed' }
    }
});

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
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString }
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

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addClient: {
            type: ClientType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                email: { type: new GraphQLNonNull(GraphQLString) },
                phone: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve: async (_parent, { name, email, phone }) => {
                return await Client.create({
                    name,
                    email,
                    phone
                });
            }
        },
        updateClient: {
            type: ClientType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                name: { type: GraphQLString },
                email: { type: GraphQLString },
                phone: { type: GraphQLString },
            },
            resolve: async (_parent, { id, name, email, phone }) => {
                return await Client.findByIdAndUpdate(id, {
                    name,
                    email,
                    phone
                },
                    { new: true });
            }
        },
        deleteClient: {
            type: ClientType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve: async (_parent, { id }) => {
                const projects = await Project.find({ clientId: id });
                projects.forEach(project => project.remove());

                return await Client.findByIdAndDelete(id);
            }
        },
        addProject: {
            type: ProjectType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                description: { type: new GraphQLNonNull(GraphQLString) },
                status: {
                    type: ProjectStatusEnum,
                    defaultValue: 'Not Started'
                },
                clientId: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve: async (_parent, { name, description, status, clientId }) => {
                return await Project.create({
                    name,
                    description,
                    status,
                    clientId
                });
            }
        },
        updateProject: {
            type: ProjectType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                name: { type: GraphQLString },
                description: { type: GraphQLString },
                status: {
                    type: ProjectStatusEnum,
                    defaultValue: 'Not Started'
                }
            },
            resolve: async (_parent, { id, name, description, status }) => {
                return await Project.findOneAndUpdate(id, {
                    name,
                    description,
                    status
                });
            }
        },
        deleteProject: {
            type: ProjectType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve: async (_parent, { id }) => {
                return await Project.findByIdAndDelete(id);
            }
        }
    }
});

const schema = new GraphQLSchema({
    query: RootQuery,
    mutation
});

export default schema;