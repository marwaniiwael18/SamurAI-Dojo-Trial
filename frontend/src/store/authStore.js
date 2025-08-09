import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import authService from '../services/authService'

const useAuthStore = create(
  persist(
    immer((set, get) => ({
      // State
      user: null,
      profile: null,
      workspaces: [],
      token: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
      lastActivity: null,

      // Actions
      setLoading: (loading) => {
        set((state) => {
          state.isLoading = loading
        })
      },

      setAuth: (authData) => {
        set((state) => {
          state.user = authData.user
          state.profile = authData.profile
          state.workspaces = authData.workspaces || []
          state.token = authData.token
          state.refreshToken = authData.refreshToken
          state.isAuthenticated = true
          state.lastActivity = new Date().toISOString()
        })
      },

      updateProfile: (profileData) => {
        set((state) => {
          state.profile = { ...state.profile, ...profileData }
        })
      },

      updateUser: (userData) => {
        set((state) => {
          state.user = { ...state.user, ...userData }
        })
      },

      addWorkspace: (workspace) => {
        set((state) => {
          state.workspaces.push(workspace)
        })
      },

      updateWorkspace: (workspaceId, updates) => {
        set((state) => {
          const index = state.workspaces.findIndex(w => w._id === workspaceId)
          if (index !== -1) {
            state.workspaces[index] = { ...state.workspaces[index], ...updates }
          }
        })
      },

      removeWorkspace: (workspaceId) => {
        set((state) => {
          state.workspaces = state.workspaces.filter(w => w._id !== workspaceId)
        })
      },

      clearAuth: () => {
        set((state) => {
          state.user = null
          state.profile = null
          state.workspaces = []
          state.token = null
          state.refreshToken = null
          state.isAuthenticated = false
          state.lastActivity = null
        })
      },

      // Async actions
      register: async (userData) => {
        set((state) => {
          state.isLoading = true
        })

        try {
          const response = await authService.register(userData)
          
          // Registration successful - don't auto-login, user needs to verify email
          console.log('Registration successful:', response)
          
          set((state) => {
            state.isLoading = false
          })

          return { success: true, data: response.data }
        } catch (error) {
          console.error('Registration error in authStore:', error)
          
          set((state) => {
            state.isLoading = false
          })

          // Extract error message
          let errorMessage = 'Registration failed'
          
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message
          } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
            errorMessage = error.response.data.errors.map(err => err.msg || err.message).join(', ')
          } else if (error.message) {
            errorMessage = error.message
          }
          
          return { success: false, error: errorMessage }
        }
      },

      login: async (credentials) => {
        set((state) => {
          state.isLoading = true
        })

        try {
          const response = await authService.login(credentials)
          
          get().setAuth({
            user: response.data.user,
            profile: response.data.profile,
            workspaces: response.data.workspaces,
            token: response.token,
            refreshToken: response.refreshToken
          })

          set((state) => {
            state.isLoading = false
          })

          return { success: true, data: response.data }
        } catch (error) {
          set((state) => {
            state.isLoading = false
          })

          const message = error.response?.data?.message || 'Login failed'
          
          return { success: false, error: message }
        }
      },

      logout: async () => {
        try {
          await authService.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          get().clearAuth()
        }
      },

      forgotPassword: async (email) => {
        set((state) => {
          state.isLoading = true
        })

        try {
          await authService.forgotPassword(email)
          
          set((state) => {
            state.isLoading = false
          })

          return { success: true }
        } catch (error) {
          set((state) => {
            state.isLoading = false
          })

          const message = error.response?.data?.message || 'Failed to send reset link'
          
          return { success: false, error: message }
        }
      },

      resetPassword: async (token, passwords) => {
        set((state) => {
          state.isLoading = true
        })

        try {
          const response = await authService.resetPassword(token, passwords)
          
          get().setAuth({
            user: response.data.user,
            token: response.token,
            refreshToken: response.refreshToken
          })

          set((state) => {
            state.isLoading = false
          })

          return { success: true }
        } catch (error) {
          set((state) => {
            state.isLoading = false
          })

          const message = error.response?.data?.message || 'Password reset failed'
          
          return { success: false, error: message }
        }
      },

      verifyEmail: async (token) => {
        set((state) => {
          state.isLoading = true
        })

        try {
          await authService.verifyEmail(token)
          
          // Update user's email verification status
          set((state) => {
            if (state.user) {
              state.user.emailVerified = true
            }
            state.isLoading = false
          })

          return { success: true }
        } catch (error) {
          set((state) => {
            state.isLoading = false
          })

          const message = error.response?.data?.message || 'Email verification failed'
          
          return { success: false, error: message }
        }
      },

      updatePassword: async (passwords) => {
        set((state) => {
          state.isLoading = true
        })

        try {
          await authService.updatePassword(passwords)
          
          set((state) => {
            state.isLoading = false
          })

          return { success: true }
        } catch (error) {
          set((state) => {
            state.isLoading = false
          })

          const message = error.response?.data?.message || 'Password update failed'
          
          return { success: false, error: message }
        }
      },

      refreshAuthToken: async () => {
        const { refreshToken } = get()
        
        if (!refreshToken) {
          get().clearAuth()
          return false
        }

        try {
          const response = await authService.refreshToken(refreshToken)
          
          set((state) => {
            state.token = response.token
            state.refreshToken = response.refreshToken
            state.lastActivity = new Date().toISOString()
          })

          return true
        } catch (error) {
          console.error('Token refresh failed:', error)
          get().clearAuth()
          return false
        }
      },

      initializeAuth: async () => {
        const { token, refreshToken } = get()
        
        if (!token) {
          set((state) => {
            state.isLoading = false
          })
          return
        }

        try {
          set((state) => {
            state.isLoading = true
          })

          // Try to get current user data
          const response = await authService.getCurrentUser()
          
          get().setAuth({
            user: response.data.user,
            profile: response.data.profile,
            workspaces: response.data.workspaces,
            token,
            refreshToken
          })

        } catch (error) {
          console.error('Auth initialization failed:', error)
          
          // Try to refresh token
          const refreshed = await get().refreshAuthToken()
          
          if (!refreshed) {
            get().clearAuth()
          }
        } finally {
          set((state) => {
            state.isLoading = false
          })
        }
      },

      // Utility methods
      hasPermission: (permission, workspaceId) => {
        const { workspaces } = get()
        
        if (!workspaceId) return false
        
        const workspace = workspaces.find(w => w.workspace._id === workspaceId)
        return workspace?.permissions?.[permission] || false
      },

      isWorkspaceAdmin: (workspaceId) => {
        const { workspaces } = get()
        
        if (!workspaceId) return false
        
        const workspace = workspaces.find(w => w.workspace._id === workspaceId)
        return ['creator', 'admin'].includes(workspace?.role)
      },

      canCreateWorkspace: () => {
        const { profile } = get()
        return profile?.isProfileComplete || false
      }
    })),
    {
      name: 'samurai-auth',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        workspaces: state.workspaces,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        lastActivity: state.lastActivity
      })
    }
  )
)

export { useAuthStore }
