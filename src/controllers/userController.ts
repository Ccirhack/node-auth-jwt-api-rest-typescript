import { Request, Response } from "express";
import { hashPassword } from "../services/password.service";
import prisma from "../models/user"
import { error } from "console";
import user from "../models/user";


export const createUser = async(req:Request, res:Response): Promise<void> => {
    try {
        const { email, password } = req.body

        // Validaciones individuales
        if (!email) {
            res.status(400).json({ message: "El email es obligatorio" });
            return;
        }
        if (!password) {
            res.status(400).json({ message: "El password es obligatorio" })
            return;
        }

        const hashedPassword = await hashPassword(password)
        const user = await prisma.create(
            {
                data: {
                    email,
                    password: hashedPassword
                }
            }
        )
        res.status(201).json(user)
        return;
    } catch (error:any) {
        
        if(error?.code === "P2002" && error?.meta?.target?.includes("email")){
            res.status(400).json({ message: "El email ingresado ya existe" });
            return;
        }

        res.status(500).json({ error: "Hubo un error, pruebe más tarde" });
        return;
    }
}

export const getAllUsers = async(req:Request, res:Response): Promise<void> => {
    try {
        const users = await prisma.findMany()
        res.status(200).json(users);
        return;
    } catch (error:any) {
        res.status(500).json({ error: "Hubo un error, pruebe más tarde" })
    }
}


export const getUserById = async(req:Request, res:Response): Promise<void> => {
    
    const userId = parseInt(req.params.id)

    try {
        const user = await prisma.findUnique({
            where: {
                id: userId
            }
        })

        if(!user){
            res.status(404).json({error: "El usuario no fue encontrado"});
            return;
        }
        res.status(200).json(user);
        return;
    } catch (error:any) {
        res.status(500).json({ error: "Hubo un error, pruebe más tarde" })
    }
}


export const updateUser = async(req:Request, res:Response): Promise<void> => {
    
    const userId = parseInt(req.params.id)
    const {email, password} = req.body
    try {

        let dataToUpdate: any = { ...req.body }

        if(password) {
            const hashedPassword = await hashPassword(password)
            dataToUpdate.password = hashedPassword
        }

        if(email){
            dataToUpdate.email = email
        }

        const user = await prisma.update({
            where: {
                id: userId
            },
            data: dataToUpdate
        })

        res.status(200).json(user);
        return;
    } catch (error:any) {
        if(error?.code === "P2002" && error?.meta?.target?.includes("email")){
            res.status(400).json({error: "El email ingresado ya existe"})
            return;
        } else if (error?.code === "P2025") {
            res.status(404).json("Usuario no encontrado");
            return;
        } else {
            res.status(500).json({ error: "Hubo un error, pruebe más tarde" });
            return;
        }
    }
}


export const deleteUser = async(req:Request, res: Response):Promise<void> => {
    const userId = parseInt(req.params.id)
    try {
        await prisma.delete({
            where: {
                id:userId
            }
        })

        res.status(200).json({
            message: `El usuario ${userId} ha sido eliminado`
        }).end();
        return;
    } catch (error:any) {
        if (error?.code === "P2025") {
            res.status(404).json("Usuario no encontrado")
            return;
        } else {
            res.status(500).json({ error: "Hubo un error, pruebe más tarde" });
            return;
        }
    }
}
