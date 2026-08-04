import { isRewardedContentType, rewardGrantAmount } from '../src/services/reward.service';

describe('rewarded monetization rules', () => {
  it('accepts only supported content categories', () => {
    expect(isRewardedContentType('lesson')).toBe(true);
    expect(isRewardedContentType('reading')).toBe(true);
    expect(isRewardedContentType('course')).toBe(false);
    expect(isRewardedContentType('../lesson')).toBe(false);
  });

  it('uses server-configured AI rewards and never grants less than one', () => {
    const config = { voiceCallsPerReward: 1, voiceTurnsPerReward: 2 };
    expect(rewardGrantAmount('content', config)).toBe(1);
    expect(rewardGrantAmount('voiceCall', config)).toBe(1);
    expect(rewardGrantAmount('voiceTurn', config)).toBe(2);
    expect(rewardGrantAmount('voiceTurn', { ...config, voiceTurnsPerReward: 0 })).toBe(1);
  });
});
