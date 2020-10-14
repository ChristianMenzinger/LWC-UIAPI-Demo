import { LightningElement, api, wire } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class PicklistTile extends LightningElement {
  //
  //exposed properties
  //
  @api recordId;
  @api objectApiName;
  @api picklistFieldApiName;

  //
  //variables
  //
  get picklistFieldForWireAdapter() {
    if (this.picklistFieldApiName && this.objectApiName) {
      return this.objectApiName + "." + this.picklistFieldApiName;
    }
    return null;
  }

  wiredRecordTypeId;
  wiredPicklistValuesData;
  wiredSelectedPicklistEntry;

  picklistFieldList = [];

  //
  // services
  //
  @wire(getRecord, {
    recordId: "$recordId",
    fields: "$picklistFieldForWireAdapter"
  })
  wiredRecord({ error, data }) {
    if (data) {
      this.wiredSelectedPicklistEntry = data.fields[this.picklistFieldApiName];
      this.wiredRecordTypeId = data.recordTypeId;
    } else if (error) {
      this.showErrorToast();
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "$wiredRecordTypeId",
    fieldApiName: "$picklistFieldForWireAdapter"
  })
  wiredPicklistValues({ error, data }) {
    if (data) {
      this.wiredPicklistValuesData = data;
      this.createDataStructure();
    } else if (error) {
      this.showErrorToast();
    }
  }

  //
  // private functions
  //
  createDataStructure() {
    let picklistFieldList = [];
    this.wiredPicklistValuesData.values.forEach((picklistDataEntry) => {
      picklistFieldList.push({
        label: picklistDataEntry.label,
        value: picklistDataEntry.value,
        isSelected:
          picklistDataEntry.value === this.wiredSelectedPicklistEntry.value
      });
    });
    this.picklistFieldList = picklistFieldList;
  }

  showErrorToast() {
    const evt = new ShowToastEvent({
      title: "ERROR",
      message: "An error occured!",
      variant: "error"
    });
    this.dispatchEvent(evt);
  }
}
