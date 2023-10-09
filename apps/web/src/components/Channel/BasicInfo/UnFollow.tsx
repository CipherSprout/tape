import useHandleWrongNetwork from '@hooks/useHandleWrongNetwork'
import useAuthPersistStore from '@lib/store/auth'
import useChannelStore from '@lib/store/channel'
import { Trans } from '@lingui/macro'
import { Button } from '@radix-ui/themes'
import { LENSHUB_PROXY_ABI } from '@tape.xyz/abis'
import { Analytics, TRACK } from '@tape.xyz/browser'
import {
  LENSHUB_PROXY_ADDRESS,
  REQUESTING_SIGNATURE_MESSAGE
} from '@tape.xyz/constants'
import { getSignature } from '@tape.xyz/generic'
import type { CreateUnfollowBroadcastItemResult, Profile } from '@tape.xyz/lens'
import {
  useBroadcastOnchainMutation,
  useCreateUnfollowTypedDataMutation,
  useUnfollowMutation
} from '@tape.xyz/lens'
import type { CustomErrorWithData } from '@tape.xyz/lens/custom-types'
import type { FC } from 'react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useContractWrite, useSignTypedData } from 'wagmi'

type Props = {
  profile: Profile
  onUnSubscribe: () => void
  size?: '1' | '2' | '3'

  showText?: boolean
}

const UnFollow: FC<Props> = ({ profile, onUnSubscribe, size = '2' }) => {
  const [loading, setLoading] = useState(false)
  const selectedSimpleProfile = useAuthPersistStore(
    (state) => state.selectedSimpleProfile
  )
  const activeChannel = useChannelStore((state) => state.activeChannel)
  const canUseRelay = activeChannel?.lensManager && activeChannel?.sponsor
  const handleWrongNetwork = useHandleWrongNetwork()

  const onError = (error: CustomErrorWithData) => {
    toast.error(error?.data?.message ?? error?.message)
    setLoading(false)
  }
  const onCompleted = (__typename?: 'RelayError' | 'RelaySuccess') => {
    if (__typename === 'RelayError') {
      return
    }

    setLoading(false)
    onUnSubscribe()
    toast.success(`Unsubscribed ${profile.handle}`)
    Analytics.track(TRACK.CHANNEL.UNSUBSCRIBE, {
      channel_id: profile.id,
      channel_name: profile.handle
    })
  }

  const { signTypedDataAsync } = useSignTypedData({
    onError
  })

  const [broadcast] = useBroadcastOnchainMutation({
    onCompleted: ({ broadcastOnchain }) =>
      onCompleted(broadcastOnchain.__typename),
    onError
  })

  const { write } = useContractWrite({
    address: LENSHUB_PROXY_ADDRESS,
    abi: LENSHUB_PROXY_ABI,
    functionName: 'burn',
    onSuccess: () => onCompleted(),
    onError
  })

  const [createUnfollowTypedData] = useCreateUnfollowTypedDataMutation({
    onCompleted: async ({ createUnfollowTypedData }) => {
      const { typedData, id } =
        createUnfollowTypedData as CreateUnfollowBroadcastItemResult
      try {
        toast.loading(REQUESTING_SIGNATURE_MESSAGE)
        const signature = await signTypedDataAsync(getSignature(typedData))
        const { data } = await broadcast({
          variables: { request: { id, signature } }
        })
        if (data?.broadcastOnchain?.__typename === 'RelayError') {
          const { idsOfProfilesToUnfollow, unfollowerProfileId } =
            typedData.value
          return write?.({
            args: [unfollowerProfileId, idsOfProfilesToUnfollow]
          })
        }
      } catch {
        setLoading(false)
      }
    },
    onError
  })

  const [unFollowMutation] = useUnfollowMutation({
    onCompleted: () => onCompleted(),
    onError
  })

  const unfollow = async () => {
    if (!selectedSimpleProfile?.id) {
      return toast.error('Sign in to proceed')
    }
    if (handleWrongNetwork()) {
      return
    }

    setLoading(true)
    if (canUseRelay) {
      return await unFollowMutation({
        variables: {
          request: {
            unfollow: [profile.id]
          }
        }
      })
    }
    return createUnfollowTypedData({
      variables: {
        request: { unfollow: [profile?.id] }
      }
    })
  }

  return (
    <Button
      size={size}
      onClick={() => unfollow()}
      variant="classic"
      highContrast
      disabled={loading}
    >
      <Trans>Unfollow</Trans>
    </Button>
  )
}

export default UnFollow