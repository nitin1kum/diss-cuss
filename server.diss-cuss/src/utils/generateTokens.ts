import 'dotenv/config'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { AuthUser } from '../types/types';
import { prisma } from '../lib/prisma';

export const generateTokens = async (user : AuthUser) => {
    const accessToken = jwt.sign({
        id: user.id,
        username: user.username,
        email : user.email,
        emailVerified : user.emailVerified,
        image : user.image
    }, process.env.JWT_SECRET!,
        { expiresIn: '5m' });

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const token = await prisma.refreshToken.create({
        data : {
            token : refreshToken,
            user_id : user.id,
            expiresAt : expiresAt
        }
    })

    return {accessToken,refreshToken : token.token};
}