import ky from 'ky'

const createApi = (getToken: () => Promise<string | null>) =>
  ky.create({
    prefix: import.meta.env.VITE_API_URL,  // ← was prefixUrl
    hooks: {
      beforeRequest: [
        async (request) => {
          const token = await getToken()
          if (token) request.headers.set('Authorization', `Bearer ${token}`)
        },
      ],
    },
  })

export default createApi