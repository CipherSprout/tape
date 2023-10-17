import { type OpenActionModule } from '@tape.xyz/lens'

export const getCollectModuleOutput = (openActionModule: OpenActionModule) => {
  const output = {
    collectLimit: 0,
    amount: {
      rate: '',
      value: '',
      assetAddress: '',
      assetDecimals: '',
      assetSymbol: ''
    },
    recipient: '',
    recipients: [],
    referralFee: 0,
    endsAt: '',
    followerOnly: false
  }
  switch (openActionModule.__typename) {
    case 'SimpleCollectOpenActionSettings':
      return {
        ...output,
        collectLimit: openActionModule.collectLimit,
        amount: {
          value: openActionModule.amount?.value,
          assetSymbol: openActionModule.amount?.asset.symbol,
          assetAddress: openActionModule.amount?.asset.contract.address,
          assetDecimals: openActionModule.amount?.asset.decimals,
          rate: openActionModule.amount?.rate?.value
        },
        recipient: openActionModule.recipient,
        referralFee: openActionModule.referralFee,
        endsAt: openActionModule.endsAt,
        followerOnly: openActionModule.followerOnly
      }
    case 'MultirecipientFeeCollectOpenActionSettings':
      return {
        ...output,
        collectLimit: openActionModule.collectLimit,
        amount: {
          value: openActionModule.amount?.value,
          assetSymbol: openActionModule.amount?.asset.symbol,
          assetAddress: openActionModule.amount?.asset.contract.address,
          assetDecimals: openActionModule.amount?.asset.decimals,
          rate: openActionModule.amount?.rate?.value
        },
        recipients: openActionModule.recipients,
        referralFee: openActionModule.referralFee,
        endsAt: openActionModule.endsAt,
        followerOnly: openActionModule.followerOnly
      }
    default:
      break
  }
}