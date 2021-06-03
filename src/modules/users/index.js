import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import './model'

import { prisma } from '~/data'

import { decodeBasicToken } from './services'

export const login = async ctx => {
  try {
    const [email, password] = decodeBasicToken(
      ctx.request.headers.authorization
    )

    const { user } = await prisma.user.findUnique({
      where: { email, password },
    })

    //relembrando que esse email e senha é shorthand (email:email destruct do ctx)

    if (!user) {
      ctx.status = 404
      return
    }

    // const passwordEqual = await bcrypt.compare(password, user.password)

    // if (!user || !passwordEqual) {
    //   ctx.status = 404
    //   return
    // }

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET)
    ctx.body = { user, token }

    // user.token = token Poderia ser essa abordagen ou a debaixo, uma dentro do user e a debaixo como um objeto separado
  } catch (error) {
    console.log(error)
    if (error.custom) {
      ctx.status = 400
      return
    }

    ctx.status = 500
    ctx.body = 'Ops! Algo deu errado, tente novamente'
    return
  }
}

export const list = async ctx => {
  try {
    const users = await prisma.user.findMany()
    ctx.body = users
  } catch (error) {
    ctx.status = 500
    ctx.body = 'Ops! Algo deu errado, tente novamente'
    return
  }
}

export const create = async ctx => {
  try {
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(
      ctx.request.body.password,
      saltRounds
    )

    const user = await prisma.user.create({
      data: {
        name: ctx.request.body.name,
        email: ctx.request.body.email,
        password: hashedPassword,
      },
    })
    ctx.body = user
  } catch (err) {
    console.lor(err)
    ctx.status = 500
    ctx.body = 'Ops! Algo deu errado, tente novamente'
  }
}

export const update = async ctx => {
  const { name, email } = ctx.request.body

  try {
    const user = await prisma.user.update({
      where: { id: ctx.params.id },
      data: { name, email },
    })
    ctx.body = user
  } catch (err) {
    ctx.status = 500
    ctx.body = 'Ops! Algo deu errado, tente novamente'
  }
}

//ctx.body é a resposta do que se tem

export const remove = async ctx => {
  try {
    await prisma.user.delete({
      where: { id: ctx.params.id },
    })
    ctx.body = { id: ctx.params.id }
  } catch (err) {
    ctx.status = 500
    ctx.body = 'Ops! Algo deu errado, tente novamente'
  }
}
