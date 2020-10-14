import { LightningElement, api, wire } from "lwc";
import { getListUi } from "lightning/uiListApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class ListViewTile extends LightningElement {
  //
  //exposed properties
  //
  @api objectAPIName;
  @api listViewAPIName;

  //
  //variables
  //
  recordList = [];
  fieldList = [];

  //
  //services
  //
  @wire(getListUi, {
    objectApiName: "$objectAPIName",
    listViewApiName: "$listViewAPIName",
    pageSize: 50
  })
  wiredListView({ error, data }) {
    if (data && this.listViewAPIName) {
      this.createDataStructure(data);
    } else if (error) {
      this.showErrorToast();
    }
  }

  //
  //private functions
  //
  createDataStructure(data) {
    let fieldList = [];
    let recordList = [];

    //get all field api names in the configured order
    data.info.displayColumns.forEach((element) => {
      let field = element.fieldApiName;
      //ignore concatenated fields like Owner.id for now
      if (field.indexOf(".") === -1) {
        fieldList.push(field);
      }
    });

    //create data structure which can be easily used in template
    data.records.records.forEach((recordData, index) => {
      let fieldValues = [];
      fieldList.forEach((fieldName) => {
        fieldValues.push({
          fieldName: fieldName,
          fieldValue: recordData.fields[fieldName].value,
          uniqueKey: fieldName + index
        });
      });

      //create data structure for the visual container
      let record = {};
      record.id = recordData.id;
      record.name = recordData.fields.Name.value;
      record.relativeLink = "/" + recordData.id;
      record.fieldValues = fieldValues;
      recordList.push(record);
    });

    this.fieldList = fieldList;
    this.recordList = recordList;
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
