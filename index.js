const express = require('express')
const { graphqlHTTP } = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql')
const app = express()

let hospitals = [
    { id: 1, name: 'Kaiser Permanante' },
    { id: 2, name: 'BannerHealth' },
    { id: 3, name: 'Hoag Health Center' }
]

let patients = [
    { id: 1, name: 'Robert Baratheon', age: 20, ageRange: '20-24', hospitalId: 1 },
    { id: 2, name: 'Tyrion Lannister', age: 27, ageRange: '25-29', hospitalId: 1 },
    { id: 3, name: 'Cersei Lannister', age: 45, ageRange: '45-49', hospitalId: 1 },
    { id: 4, name: 'Daenerys Targaryen', age: 18, ageRange: '15-19', hospitalId: 1 },
    { id: 5, name: 'Dennis Reynolds', age: 35, ageRange: '35-39', hospitalId: 2 },
    { id: 6, name: 'Dee Reynolds', age: 32, ageRange: '30-34', hospitalId: 2 },
    { id: 7, name: 'Frank Reynolds', age: 65, ageRange: '65-69', hospitalId: 2 },
    { id: 8, name: 'Dwight Schrute', age: 40, ageRange: '40-44', hospitalId: 3 },
    { id: 9, name: 'Michael Scott', age: 48, ageRange: '45-49', hospitalId: 3 },
    { id: 10, name: 'Pam Beesly', age: 33, ageRange: '30-34', hospitalId: 3 }
]

const PatientType = new GraphQLObjectType({
    name: 'Patient',
    description: 'This represents a patient from a hospital',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        age: { type: GraphQLInt },
        ageRange: { type: GraphQLString },
        hospitalId: { type: GraphQLNonNull(GraphQLInt) },
        hospital: {
            type: HospitalType,
            resolve: (patient) => {
                return hospitals.find(hospital => hospital.id === patient.hospitalId)
            }
        }
    })
})

const HospitalType = new GraphQLObjectType({
    name: 'Hospital',
    description: 'This represents a hospital with patients',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        patients: {
            type: new GraphQLList(PatientType),
            resolve: (hospital) => {
                return patients.filter(patient => patient.hospitalId === hospital.id)
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        patients: {
            type: new GraphQLList(PatientType),
            description: 'List of All Patients',
            resolve: () => patients
        },
        filterPatients: {
            type: new GraphQLList(PatientType),
            description: 'List of Patients Filtered by Specific Criteria',
            args: {
                age: { type: GraphQLInt },
                ageRange: { type: GraphQLString },
                hospitalId: { type: GraphQLInt }
            },
            resolve: (parents, args) => patients.filter(
                patient => patient.age === args.age ||
                    patient.ageRange === args.ageRange ||
                    patient.hospitalId === args.hospitalId
            )
        },
        patient: {
            type: PatientType,
            description: 'One Single Patient',
            args: {
                id: { type: GraphQLInt },
                name: { type: GraphQLString }
            },
            resolve: (parents, args) => patients.find(patient => patient.id === args.id || hospital.name === args.name)
        },
        hospitals: {
            type: new GraphQLList(HospitalType),
            description: 'List of All Hospitals',
            resolve: () => hospitals
        },
        hospital: {
            type: HospitalType,
            description: 'One Single Hospital',
            args: {
                id: { type: GraphQLInt },
                name: { type: GraphQLString }
            },
            resolve: (parents, args) => hospitals.find(hospital => hospital.id === args.id || hospital.name === args.name)
        },
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addPatient: {
            type: PatientType,
            description: 'Add a Patient',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                age: { type: GraphQLInt },
                ageRange: { type: GraphQLString },
                hospitalId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parents, args) => {
                const patient = {
                    id: patients[patients.length - 1]['id'] + 1, name: args.name, hospitalId:
                        args.hospitalId
                }
                patients.push(patient)
                return patient
            }
        },
        addHospital: {
            type: HospitalType,
            description: 'Add a Hospital',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parents, args) => {
                const hospital = { id: hospitals[hospitals.length - 1]['id'] + 1, name: args.name }
                hospitals.push(hospital)
                return hospital
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}))
app.listen(8000, () => console.log('Server Running'))