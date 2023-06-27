import { EventType } from "./EventType";
import { Ref } from "vue";
import { Module } from "../model/module";
import Log from "../Log";

export default class EventSystem {

  private static eventsList: EventListItemType[] = []

  public static listenEvent(eventType: EventType, cb: Ref<Function>) {
    EventSystem.eventsList.push({type: eventType, cb: cb})
  }

  public static removeEvent(cb: Ref<Function>) {
    for (let i = 0; i < EventSystem.eventsList.length; i++) {
      if (EventSystem.eventsList[i].cb == cb) {
        EventSystem.eventsList.splice(i, 1)
        break
      }
    }
  }

  public static fireEvent(eventType: EventType) {
    for (let i = 0; i < EventSystem.eventsList.length; i++) {
      if (EventSystem.eventsList[i].type == eventType) {
        EventSystem.eventsList[i].cb.value()
      }
    }
  }

}

interface EventListItemType {
  type: EventType
  cb: Ref<Function>
}
