import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
if(!JWT_SECRET || !JWT_REFRESH_SECRET){
    throw new  Error("jwt scrects are not defined")
}

export const generateTokens = (userId:string)=>{
    const accessToken = jwt.sign({userId},JWT_SECRET,{expiresIn:"15m"})

    const refreshToken = jwt.sign({userId},JWT_REFRESH_SECRET,{expiresIn:"7d"})

    return {accessToken,refreshToken}

}

export const verifyAccessToken = (token:string)=>{
    return jwt.verify(token,JWT_SECRET)
}

export const verifyRefreshToken = (token:string)=>{
    return jwt.verify(token,JWT_REFRESH_SECRET)
}