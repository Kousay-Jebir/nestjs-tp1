import { ActionTypeEnum } from "src/history/enum/action-type.enum";

export class ActionEvent {
    constructor(
      public readonly entityId: number,
      public readonly action: ActionTypeEnum,
      public readonly userId: number,
    ) {}
  }
  