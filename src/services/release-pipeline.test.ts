import { bumpPatchVersion } from './release-pipeline';

describe('release-pipeline', () => {
  describe('bumpPatchVersion', () => {
    it('패치 버전 +1', () => {
      expect(bumpPatchVersion('1.8.10')).toBe('1.8.11');
      expect(bumpPatchVersion('2.0.0')).toBe('2.0.1');
    });

    it('잘못된 형식은 오류', () => {
      expect(() => bumpPatchVersion('v1.8')).toThrow();
    });
  });
});
