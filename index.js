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

const hospitals = [
    { id: 1, name: 'Kaiser Permanante' },
    { id: 2, name: 'BannerHealth' },
    { id: 3, name: 'Hoag Health Center' }
]

const patients = [
    { id: 1, name: 'Robert Baratheon', hospitalId: 1 },
    { id: 2, name: 'Tyrion Lannister', hospitalId: 1 },
    { id: 3, name: 'Cersei Lannister', hospitalId: 1 },
    { id: 4, name: 'Daenerys Targaryen', hospitalId: 1 },
    { id: 5, name: 'Dennis Reynolds', hospitalId: 2 },
    { id: 6, name: 'Dee Reynolds', hospitalId: 2 },
    { id: 7, name: 'Frank Reynolds', hospitalId: 2 },
    { id: 8, name: 'Dwight Schrute', hospitalId: 3 },
    { id: 9, name: 'Michael Scott', hospitalId: 3 },
    { id: 10, name: 'Pam Beesly', hospitalId: 3 }
]

const PatientType = new GraphQLObjectType({
    name: 'Patient',
    description: 'This represents a patient from a hospital',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
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
        patient: {
            type: PatientType,
            description: 'One Single Patient',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parents, args) => patients.find(patient => patient.id === args.id)
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
                id: { type: GraphQLInt }
            },
            resolve: (parents, args) => hospitals.find(hospital => hospital.id === args.id)
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
                hospitalId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parents, args) => {
                const patient = {
                    id: patients.length + 1, name: args.name, hospitalId:
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
                const hospital = { id: hospitals.length + 1, name: args.name }
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