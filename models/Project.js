import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export const ProjectSchema = new Schema({
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'Client'
    },
    name: String,
    description: String,
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed']
    },
});

const ProjectModel = model('Project', ProjectSchema);

export default ProjectModel;