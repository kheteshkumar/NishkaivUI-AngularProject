export const FormStatus = Object.freeze({
  Created: 0,
  Published: 1,
});

interface IFormStatusValue {
  color: string;
  text: string;
}

export const FormStatusValueMap = new Map<number, IFormStatusValue>();
FormStatusValueMap.set(FormStatus.Created, { color: 'blue', text: 'Created' });
FormStatusValueMap.set(FormStatus.Published, { color: 'green', text: 'Published' });

export enum ActivationEnum {
  Activated = 1,
  Deactivated = 0,
}
