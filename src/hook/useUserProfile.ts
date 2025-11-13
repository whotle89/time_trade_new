"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"

export function useUserProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("nickname, profile_image")
        .eq("id", user.id)
        .single()

      if (!error && data) {
        setProfile(data)
      }
      setLoading(false)
    }

    getProfile()
  }, [])

  return { profile, loading }
}