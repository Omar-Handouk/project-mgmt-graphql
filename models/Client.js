import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export const ClientSchema = new Schema({
    name: String,
    email: String,
    phone: String
});

const ClientModel = model('Client', ClientSchema);

export default ClientModel;