import { Request, Response, NextFunction } from "express"
import {z, ZodSchema} from 'zod'
export const registerSchema = z.object({
    name: z.string().min(1),
    email:z.string().email('invalid email format'),
    password:z.string().min(6,"password must be atleast 6 characters")
})
export const loginSchema = z.object({
    email:z.string().email('invalid email format'),
    password:z.string().min(1,'password is required')
})

export const validate = (schema:ZodSchema)=>{
    return (req:Request,res:Response,next:NextFunction)=>{
        const result = schema.safeParse(req.body)
        if(!result.success){
            res.status(400).json({message:"valildation error",errors:result.error.issues})
        }
        req.body = result.data
        next()
    }
}