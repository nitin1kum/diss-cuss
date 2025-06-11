import 'dotenv/config'
import axios from "axios";

export const axiosTmdbInstance = axios.create({
  baseURL : `${process.env.TMDB_BASE_URL}`,
  method : 'GET',
  headers : {
    "Content-Type" : "application/json",
    "Authorization" : `Bearer ${process.env.TMDB_ACCESS_TOKEN}`
  },
})
