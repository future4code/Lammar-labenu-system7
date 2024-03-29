import { Request, Response } from "express"
import { Person } from "../models/Person"
import { TeacherDatabase } from './../database/TeacherDatabase';
import { SpecialtyDatabase } from './../database/SpecialtyDatabase';
import { TeacherSpecialtiesDatabase } from './../database/TeacherSpecialtiesDatabase';
import { TeacherSpecialty } from './../models/TeacherSpecialty';

export const createTeacher = async (req: Request, res: Response) => {
    let errorCode = 400
    try {
        const name = req.body.name as string
        const email = req.body.email as string
        const birth_date = req.body.birth_date as string
        const class_id = req.body.class_id as string
        const specialties = req.body.specialties as string[]

        if (!name || !email || !birth_date || !class_id || !specialties) {
            errorCode = 422
            throw new Error("Body inválido.")
        }

        if (birth_date.length !== 10 || birth_date[2] !== "/" || birth_date[5] !== "/") {
            errorCode = 422
            throw new Error("A data deve ser no formato DD/MM/AAAA");
        }

        const checkSpecialty = specialties.find(specialty => {
            return (specialty.toUpperCase() !== "JS" &&
                specialty.toUpperCase() !== "CSS" &&
                specialty.toUpperCase() !== "REACT" &&
                specialty.toUpperCase() !== "TYPESCRIPT" &&
                specialty.toUpperCase() !== "POO")
        })

        if (checkSpecialty) {
            errorCode = 422
            throw new Error("Favor inserir espcialidades válidas (JS, CSS, React, Typescript ou POO).")
        }

        const teacher = new Person(
            Date.now().toString(),
            name,
            email,
            birth_date,
            class_id
        )

        const teacherDB = new TeacherDatabase()
        await teacherDB.insert(teacher)

        let cont: number = 1
        specialties.forEach(async specialty => {
            const specialtyDB = new SpecialtyDatabase()
            const teacherSpecialtyDB = new TeacherSpecialtiesDatabase()

            const getSpecialties = await specialtyDB.select()

            const findSpecialty = getSpecialties.find(specialtyTable => {
                return specialtyTable.name.toUpperCase() === specialty.toUpperCase()
            })

            const teacherSpecialty = new TeacherSpecialty(
                Date.now().toString() + cont,
                teacher.id,
                findSpecialty.id
            )
            cont++
            await teacherSpecialtyDB.insert(teacherSpecialty)

        });

        res.status(201).end()
    } catch (error) {
        res.status(errorCode).send({ message: error.message })
    }
}