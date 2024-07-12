import { apiHandler, validateAuthentication, validateAuthenticationWithSession } from '@/utils/api'
import { FileforgeClient } from '@fileforge/client'
import createHttpError from 'http-errors'
import { NextApiHandler } from 'next'

const getPDF: NextApiHandler<{ data: string }> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res)

  const { htmlAsStr } = req.body

  if (typeof htmlAsStr != 'string') throw new createHttpError.BadRequest('Oops, houve um erro.')
  const ff = new FileforgeClient({
    apiKey: process.env.FILEFORGE_API_KEY,
  })
  const pdf = await ff.pdf.generate(
    [new File([htmlAsStr], 'index.html', { type: 'text/html' })],
    {
      options: {
        host: true,
        test: false,
      },
    },
    {
      timeoutInSeconds: 30,
    }
  )
  console.log(pdf)
  return res.status(200).json({ data: pdf.url })
}

export default apiHandler({ POST: getPDF })
