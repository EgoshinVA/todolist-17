import { instance } from "common/instance"
import { BaseResponse } from "common/types"
import { LoginArgs } from "./authAPI.types"
import { baseApi } from "../../../app/baseApi"

export const _authApi = {
  login(payload: LoginArgs) {
    return instance.post<BaseResponse<{ userId: number; token: string }>>(`auth/login`, payload)
  },
  logout() {
    return instance.delete<BaseResponse>("auth/login")
  },
  me() {
    return instance.get<BaseResponse<{ id: number; email: string; login: string }>>("auth/me")
  },
}

export const authAPI = baseApi.injectEndpoints({
  endpoints: (build) => ({
    authMe: build.query<BaseResponse<{ id: number; email: string; login: string }>, void>({
      query: () => "auth/me",
    }),
    login: build.mutation<BaseResponse<{ userId: number; token: string }>, LoginArgs>({
      query: (payload) => ({
        url: `auth/login`,
        body: payload,
        method: "POST",
      })
    }),
    logout: build.mutation<BaseResponse, void>({
      query: () => ({
        url: "auth/login",
        method: "DELETE"
      })
    })
  }),
})

export const { useAuthMeQuery, useLoginMutation, useLogoutMutation } = authAPI
