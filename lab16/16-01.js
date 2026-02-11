const http = require('http');
const {graphql, buildSchema} = require('graphql');
const sql = require('mssql');

let config = {
    user: 'student',
    password: 'fitfit',
    server: 'localhost',
    database: 'VAV',
    options: {
        encrypt: false,
        trustServerCertificate: true
    },
    pool: {
        max: 10,
        min: 1,
        idleTimeoutMillis: 30000
    }
};

const poolPromise = sql.connect(config)
    .then(pool => {
        console.log('MSSQL connected');
        return pool;
    })
    .catch(err => {
        console.error('MSSQL connection error: ' + err.message);
        throw err;
    });

let schemaSDL = `
    schema{
        query: Query
        mutation: Mutation
    }
    type Faculty{
        faculty: String!
        faculty_name: String!
    }
    type Pulpit{
        pulpit: String!
        pulpit_name: String!
        faculty: String!
    }
    type Teacher{
        teacher: String!
        teacher_name: String!
        pulpit: String!
        faculty: String
    }
    type Subject{
        subject: String!
        subject_name: String!
        pulpit: String!
    }
    type PulpitWithSubjects{
        pulpit: String!
        pulpit_name: String!
        subjects: [Subject!]
        faculty: String
    }
    type Query{
        getFaculties(faculty: String): [Faculty!]
        getTeachers(teacher: String): [Teacher!]
        getPulpits(pulpit: String): [Pulpit!]
        getSubjects(subject: String): [Subject!]

        getTeachersByFaculty(faculty: String!): [Teacher!]!
        getSubjectsByFaculties(faculty: String!): [PulpitWithSubjects!]!
    }

    input FacultyInput{
        faculty: String!
        faculty_name: String!
    }
    input TeacherInput{
        teacher: String!
        teacher_name: String!
        pulpit: String!
    }
    input PulpitInput{
        pulpit: String!
        pulpit_name: String!
        faculty: String!
    }
    input SubjectInput{
        subject: String!
        subject_name: String!
        pulpit: String!
    }

    type Mutation{
        setFaculty(faculty: FacultyInput!): Faculty!
        setTeacher(teacher: TeacherInput!): Teacher!
        setPulpit(pulpit: PulpitInput!): Pulpit!
        setSubject(subject: SubjectInput!): Subject!

        delFaculty(faculty: String!): Boolean!
        delTeacher(teacher: String!): Boolean!
        delPulpit(pulpit: String!): Boolean!
        delSubject(subject: String!): Boolean!
    }
`

let schema = buildSchema(schemaSDL);

let root = {
    getFaculties: async ({ faculty }) => {
        let pool = await poolPromise;
        let req = pool.request();
        if (faculty) {
        req.input('FACULTY', sql.Char(10), faculty);
        let r = await req.query('SELECT FACULTY as faculty, FACULTY_NAME as faculty_name FROM FACULTY WHERE FACULTY = @FACULTY');
        return r.recordset;
        } else {
        let r = await req.query('SELECT FACULTY as faculty, FACULTY_NAME as faculty_name FROM FACULTY');
        return r.recordset;
        }
    },
    getTeachers: async ({ teacher }) => {
        let pool = await poolPromise;
        let req = pool.request();
        if (teacher) {
        req.input('TEACHER', sql.Char(10), teacher);
        let r = await req.query('SELECT TEACHER as teacher, TEACHER_NAME as teacher_name, PULPIT as pulpit FROM TEACHER WHERE TEACHER = @TEACHER');
        return r.recordset;
        } else {
        let r = await req.query('SELECT TEACHER as teacher, TEACHER_NAME as teacher_name, PULPIT as pulpit FROM TEACHER');
        return r.recordset;
        }
    },
    getPulpits: async ({ pulpit }) => {
        let pool = await poolPromise;
        let req = pool.request();
        if (pulpit) {
        req.input('PULPIT', sql.Char(20), pulpit);
        let r = await req.query('SELECT PULPIT as pulpit, PULPIT_NAME as pulpit_name, FACULTY as faculty FROM PULPIT WHERE PULPIT = @PULPIT');
        return r.recordset;
        } else {
        let r = await req.query('SELECT PULPIT as pulpit, PULPIT_NAME as pulpit_name, FACULTY as faculty FROM PULPIT');
        return r.recordset;
        }
    },
    getSubjects: async ({ subject }) => {
        let pool = await poolPromise;
        let req = pool.request();
        if (subject) {
        req.input('SUBJECT', sql.Char(10), subject);
        let r = await req.query('SELECT SUBJECT as subject, SUBJECT_NAME as subject_name, PULPIT as pulpit FROM SUBJECT WHERE SUBJECT = @SUBJECT');
        return r.recordset;
        } else {
        let r = await req.query('SELECT SUBJECT as subject, SUBJECT_NAME as subject_name, PULPIT as pulpit FROM SUBJECT');
        return r.recordset;
        }
    },
    getTeachersByFaculty: async ({ faculty }) => {
        let pool = await poolPromise;
        let req = pool.request().input('FACULTY', sql.Char(10), faculty);
        let r = await req.query(`
        SELECT t.TEACHER as teacher, t.TEACHER_NAME as teacher_name, t.PULPIT as pulpit, p.FACULTY as faculty
        FROM TEACHER t
        JOIN PULPIT p ON p.PULPIT = t.PULPIT
        WHERE p.FACULTY = @FACULTY
        `);
        return r.recordset;
    },
    getSubjectsByFaculties: async ({ faculty }) => {
        let pool = await poolPromise;
        let req = pool.request().input('FACULTY', sql.Char(10), faculty);
        let r = await req.query(`
        SELECT p.PULPIT as pulpit, p.PULPIT_NAME as pulpit_name, p.FACULTY as faculty,
        s.PULPIT as s_pulpit, s.SUBJECT as subject, s.SUBJECT_NAME as subject_name
        FROM PULPIT p
        LEFT JOIN SUBJECT s ON s.PULPIT = p.PULPIT
        WHERE p.FACULTY = @FACULTY
        ORDER BY p.PULPIT
        `);
        let map = new Map();
        for (let row of r.recordset) {
            if (!map.has(row.pulpit)) {
                map.set(row.pulpit, { pulpit: row.pulpit, pulpit_name: row.pulpit_name, faculty: row.faculty, subjects: [] });
            }
            if (row.subject) {
                map.get(row.pulpit).subjects.push({
                    subject: row.subject,
                    subject_name: row.subject_name,
                    pulpit: row.s_pulpit
                });
            }
        }
        return Array.from(map.values());
    },


    setFaculty: async ({ faculty }) => {
        let pool = await poolPromise;
        let req = pool.request()
        .input('FACULTY', sql.Char(10), faculty.faculty)
        .input('FACULTY_NAME', sql.VarChar(50), faculty.faculty_name);

        await req.query(`
        IF EXISTS (SELECT 1 FROM FACULTY WHERE FACULTY = @FACULTY)
            UPDATE FACULTY
            SET FACULTY_NAME = @FACULTY_NAME
            WHERE FACULTY = @FACULTY;
        ELSE
            INSERT INTO FACULTY (FACULTY, FACULTY_NAME)
            VALUES (@FACULTY, @FACULTY_NAME);
        `);

        return faculty;
    },
    setPulpit: async ({ pulpit }) => {
        let pool = await poolPromise;
        let req = pool.request()
        .input('PULPIT', sql.Char(20), pulpit.pulpit)
        .input('PULPIT_NAME', sql.VarChar(100), pulpit.pulpit_name)
        .input('FACULTY', sql.Char(10), pulpit.faculty);

        await req.query(`
        IF EXISTS (SELECT 1 FROM PULPIT WHERE PULPIT = @PULPIT)
            UPDATE PULPIT
            SET PULPIT_NAME = @PULPIT_NAME,
                FACULTY = @FACULTY
            WHERE PULPIT = @PULPIT;
        ELSE
            INSERT INTO PULPIT (PULPIT, PULPIT_NAME, FACULTY)
            VALUES (@PULPIT, @PULPIT_NAME, @FACULTY);
        `);

        return pulpit;
    },
    setTeacher: async ({ teacher }) => {
        let pool = await poolPromise;
        let req = pool.request()
        .input('TEACHER', sql.Char(10), teacher.teacher)
        .input('TEACHER_NAME', sql.VarChar(100), teacher.teacher_name)
        .input('PULPIT', sql.Char(20), teacher.pulpit);

        await req.query(`
        IF EXISTS (SELECT 1 FROM TEACHER WHERE TEACHER = @TEACHER)
            UPDATE TEACHER
            SET TEACHER_NAME = @TEACHER_NAME,
                PULPIT = @PULPIT
            WHERE TEACHER = @TEACHER;
        ELSE
            INSERT INTO TEACHER (TEACHER, TEACHER_NAME, PULPIT)
            VALUES (@TEACHER, @TEACHER_NAME, @PULPIT);
        `);

        return teacher;
    },
    setSubject: async ({ subject }) => {
        let pool = await poolPromise;
        let req = pool.request()
        .input('SUBJECT', sql.Char(10), subject.subject)
        .input('SUBJECT_NAME', sql.VarChar(100), subject.subject_name)
        .input('PULPIT', sql.Char(20), subject.pulpit);

        await req.query(`
        IF EXISTS (SELECT 1 FROM SUBJECT WHERE SUBJECT = @SUBJECT)
            UPDATE SUBJECT
            SET SUBJECT_NAME = @SUBJECT_NAME,
                PULPIT = @PULPIT
            WHERE SUBJECT = @SUBJECT;
        ELSE
            INSERT INTO SUBJECT (SUBJECT, SUBJECT_NAME, PULPIT)
            VALUES (@SUBJECT, @SUBJECT_NAME, @PULPIT);
        `);

        return subject;
    },


    delFaculty: async ({ faculty }) => {
        let pool = await poolPromise;
        let hasPulpits = await pool.request()
        .input('FACULTY', sql.Char(10), faculty)
        .query('SELECT TOP 1 1 AS X FROM PULPIT WHERE FACULTY = @FACULTY');
        if (hasPulpits.recordset.length) return false;

        let r = await pool.request()
        .input('FACULTY', sql.Char(10), faculty)
        .query('DELETE FROM FACULTY WHERE FACULTY = @FACULTY');
        return r.rowsAffected[0] > 0;
    },
    delPulpit: async ({ pulpit }) => {
        let pool = await poolPromise;
        let hasTeachers = await pool.request()
        .input('PULPIT', sql.Char(20), pulpit)
        .query('SELECT TOP 1 1 AS X FROM TEACHER WHERE PULPIT = @PULPIT');
        if (hasTeachers.recordset.length) return false;

        let hasSubjects = await pool.request()
        .input('PULPIT', sql.Char(20), pulpit)
        .query('SELECT TOP 1 1 AS X FROM SUBJECT WHERE PULPIT = @PULPIT');
        if (hasSubjects.recordset.length) return false;

        let r = await pool.request()
        .input('PULPIT', sql.Char(20), pulpit)
        .query('DELETE FROM PULPIT WHERE PULPIT = @PULPIT');
        return r.rowsAffected[0] > 0;
    },
    delTeacher: async ({ teacher }) => {
        let pool = await poolPromise;
        let r = await pool.request()
        .input('TEACHER', sql.Char(10), teacher)
        .query('DELETE FROM TEACHER WHERE TEACHER = @TEACHER');
        return r.rowsAffected[0] > 0;
    },
    delSubject: async ({ subject }) => {
        let pool = await poolPromise;
        let r = await pool.request()
        .input('SUBJECT', sql.Char(10), subject)
        .query('DELETE FROM SUBJECT WHERE SUBJECT = @SUBJECT');
        return r.rowsAffected[0] > 0;
    }
    
};

let server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/graphql') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            let { query, variables } = JSON.parse(body || '{}');
            let result = await graphql({
                schema,
                source: query,
                rootValue: root,
                variableValues: variables
            });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result));
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ errors: [{ message: e.message }] }));
        }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
}).listen(3000);

console.log(`Server running at http://localhost:3000/graphql`);