sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/BusyIndicator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, BusyIndicator) {
        "use strict";

        return Controller.extend("nmspSouth.southern.controller.Index", {
            onInit: async function () {
                var oView = this.getView("Index");              //Instance of view
                var oModel = new sap.ui.model.json.JSONModel(); //This model  will contain the data
                var dataModel = this.getOwnerComponent().getModel("data");//Will contain data mapped from the ODATA services

                //Date Format 20220422
                var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: "yyyyMMdd"
                });
                //Date Format 04/22/22
                var oDateFormat1 = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: "M/d/yy"
                });

                var McDate = oDateFormat.format(new Date());
                var today = oDateFormat1.format(new Date());
                var todayOn = new Date();
                todayOn.setDate(todayOn.getDate() - 1);
                todayOn = oDateFormat1.format(todayOn);

                sap.ui.core.BusyIndicator.show();

                //#region Odata Services Consumption
                //#region User
                var serviceCatUrl = "/sap/opu/odata/sap/ZODATA_MC_CATALOGUES_C_SRV/";
                //Instance of ODATA service ZODATA_MC_CATALOGUES_C_SRV
                var OdataServiceCat = new sap.ui.model.odata.ODataModel(serviceCatUrl, true);
                var UsrData = "";
                //if (!(typeof OdataServiceCat === "undefined") || !(typeof OdataServiceCat === "null")) {
                //var usrOdata = this.getUserSrv(UsrModel);
                //var usrSrv = await this.UsrRead(UsrModel, UsrData);


                //this.showBusyIndicator(8000,8000);



                var usrSrv = await this.getUserSrv(OdataServiceCat, UsrData);
                if (usrSrv[0].result === "ERROR") {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error((usrSrv[0].data));
                }
                else {

                    //#region WcdByDivision
                    //var servicetbl1Url = "/sap/opu/odata/sap/ZODATA_MC_CATALOGUES_C_SRV/";
                    //var Tbl1Model = new sap.ui.model.odata.ODataModel(serviceCatUrl, true);
                    var TblWcdData = "";
                    var WcdSrv = await this.getWcdSrv(OdataServiceCat, TblWcdData);
                    if (WcdSrv[0].result === "ERROR") {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.error((WcdSrv[0].data));
                    }
                    else {
                        //#region UnitStatDivision
                        //var servicetbl2Url = "/sap/opu/odata/sap/ZODATA_MC_CATALOGUES_C_SRV/";
                        //var TblPusRepModel = new sap.ui.model.odata.ODataModel(servicetbl2Url, true);
                        var TblPusRepData = "";
                        var PusRepSrv = await this.getPusRepSrv(OdataServiceCat, TblPusRepData);
                        if (PusRepSrv[0].result === "ERROR") {
                            sap.ui.core.BusyIndicator.hide();
                            MessageBox.error((PusRepSrv[0].data));

                        }
                        else {
                            var srvRmrksUrl = "/sap/opu/odata/sap/ZODATA_MC_WRDTREM_ST_SRV/";
                            var OdataSrvRmrks = new sap.ui.model.odata.ODataModel(srvRmrksUrl, true);
                            var RmrksData = "";
                            var rmrksSrv = await this.getRmrksSrv(OdataSrvRmrks, RmrksData);
                            if (rmrksSrv[0].result === "ERROR") {
                                sap.ui.core.BusyIndicator.hide();
                                MessageBox.error((rmrksSrv[0].data));
                            }
                            else {
                                var srvMidNgthConUrl = "/sap/opu/odata/sap/ZODATA_MC_WRST_SRV/";
                                var OdataSrvData = new sap.ui.model.odata.ODataModel(srvMidNgthConUrl, true);
                                var MidNgthCon = "";
                                var MidNgthConSrv = await this.getMidNgthConSrv(OdataSrvData, RmrksData);
                                if (MidNgthConSrv[0].result === "ERROR") {
                                    sap.ui.core.BusyIndicator.hide();
                                    MessageBox.error((MidNgthConSrv[0].data));
                                }
                                else {

                                    if (MidNgthConSrv[0].data.results[0].Mcdate === oDateFormat.format(new Date())) {
                                        //if ("DUMMY" === oDateFormat.format(new Date())) {
                                        var btnSb = oView.byId("btn_Submit");
                                        btnSb.setEnabled(false);
                                        MessageBox.warning("This form has been successfully submitted.\n\r" +
                                            "No other midnight condition report for this date may be created or submitted");
                                        dataModel.setProperty("/valSubmitted", "This form has been submitted")

                                    }
                                    //Function to mapp all data from ODATA Services to view objects
                                    dataModel = this.SetData(usrSrv, WcdSrv, PusRepSrv, rmrksSrv, MidNgthConSrv, today, dataModel, McDate)


                                    oModel.setData(null);
                                    oModel = dataModel;
                                    oView.setModel(oModel);

                                    sap.ui.core.BusyIndicator.hide();

                                    //Add functionality onfocusout to validate format for input fields with decimals
                                    var object; //Input object to validate
                                    object = oView.byId("iptFlowsProj");
                                    var decAll = 0;             //Number of decimals allowed for input object
                                    decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                    this.addEvent(object, "iptFlowsProj", "valFlowsProj", decAll);//Function to add onfocusout event to Input object

                                    object = oView.byId("iptFlows4358");
                                    var decAll = 0;             //Number of decimals allowed for input object
                                    decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                    this.addEvent(object, "iptFlows4358", "valFlows4358", decAll);//Function to add onfocusout event to Input object

                                    object = oView.byId("iptFlows5966");
                                    var decAll = 0;             //Number of decimals allowed for input object
                                    decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                    this.addEvent(object, "iptFlows5966", "valFlows5966", decAll);//Function to add onfocusout event to Input object

                                    object = oView.byId("iptFlowsTehach");
                                    var decAll = 0;             //Number of decimals allowed for input object
                                    decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                    this.addEvent(object, "iptFlowsTehach", "valFlowsTehach", decAll);//Function to add onfocusout event to Input object

                                    object = oView.byId("iptFlowsPyramid");
                                    var decAll = 0;             //Number of decimals allowed for input object
                                    decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                    this.addEvent(object, "iptFlowsPyramid", "valFlowsPyramid", decAll);//Function to add onfocusout event to Input object

                                    object = oView.byId("iptFlowsCastaic");
                                    var decAll = 0;             //Number of decimals allowed for input object
                                    decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                    this.addEvent(object, "iptFlowsCastaic", "valFlowsCastaic", decAll);//Function to add onfocusout event to Input object

                                    object = oView.byId("iptFlowsCedar");
                                    var decAll = 0;             //Number of decimals allowed for input object
                                    decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                    this.addEvent(object, "iptFlowsCedar", "valFlowsCedar", decAll);//Function to add onfocusout event to Input object

                                    object = oView.byId("iptFlowsPerris");
                                    var decAll = 0;             //Number of decimals allowed for input object
                                    decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                    this.addEvent(object, "iptFlowsPerris", "valFlowsPerris", decAll);//Function to add onfocusout event to Input object

                                    object = oView.byId("iptPipeSaplCfs");
                                    var decAll = 0;             //Number of decimals allowed for input object
                                    decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                    this.addEvent(object, "iptPipeSaplCfs", "valPipeSaplCfs", decAll);//Function to add onfocusout event to Input object

                                    object = oView.byId("iptPipeInlandCfs");
                                    var decAll = 0;             //Number of decimals allowed for input object
                                    decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                    this.addEvent(object, "iptPipeInlandCfs", "valPipeInlandCfs", decAll);//Function to add onfocusout event to Input object

                                    object = oView.byId("iptPipeRialtoCfs");
                                    var decAll = 0;             //Number of decimals allowed for input object
                                    decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                    this.addEvent(object, "iptPipeRialtoCfs", "valPipeRialtoCfs", decAll);//Function to add onfocusout event to Input object

                                    object = oView.byId("iptPipeLasFlores");
                                    var decAll = 0;             //Number of decimals allowed for input object
                                    decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                    this.addEvent(object, "iptPipeLasFlores", "valPipeLasFlores", decAll);//Function to add onfocusout event to Input object

                                    object = oView.byId("iptPbppFbay");
                                    var decAll = 0;             //Number of decimals allowed for input object
                                    decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                    this.addEvent(object, "iptPbppFbay", "valPbppFbay", decAll);//Function to add onfocusout event to Input object

                                    object = oView.byId("iptMjppFbay");
                                    var decAll = 0;             //Number of decimals allowed for input object
                                    decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                    this.addEvent(object, "iptMjppFbay", "valMjppFbay", decAll);//Function to add onfocusout event to Input object

                                    object = oView.byId("iptDcppAfter1");
                                    var decAll = 0;             //Number of decimals allowed for input object
                                    decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                    this.addEvent(object, "iptDcppAfter1", "valDcppAfter1", decAll);//Function to add onfocusout event to Input object

                                    object = oView.byId("iptDcppAfter2");
                                    var decAll = 0;             //Number of decimals allowed for input object
                                    decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                    this.addEvent(object, "iptDcppAfter2", "valDcppAfter2", decAll);//Function to add onfocusout event to Input object

                                    object = oView.byId("iptOsppFbay");
                                    var decAll = 0;             //Number of decimals allowed for input object
                                    decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                    this.addEvent(object, "iptOsppFbay", "valOsppFbay", decAll);//Function to add onfocusout event to Input object

                                    object = oView.byId("iptWwppFbay");
                                    var decAll = 0;             //Number of decimals allowed for input object
                                    decAll = this.getDecAll(object) //Function to get the value of decimals allowed from the object field(parameter specified in view)
                                    this.addEvent(object, "iptWwppFbay", "valWwppFbay", decAll);//Function to add onfocusout event to Input object


                                }
                            }
                        }
                    }
                }
            },
            showBusyIndicator: function (iDuration, iDelay) {
                BusyIndicator.show(iDelay);

                if (iDuration && iDuration > 0) {
                    if (this._sTimeoutId) {
                        clearTimeout(this._sTimeoutId);
                        this._sTimeoutId = null;
                    }

                    this._sTimeoutId = setTimeout(function () {
                        this.hideBusyIndicator();
                    }.bind(this), iDuration);
                }
            },
            hideBusyIndicator: function () {
                BusyIndicator.hide();
            },
            getUserSrv: async function (UsrModel, data) {
                //Esto sirve para saber si una variables ya esta definida
                var resolve = "";
                var reject = "";
                const oPromise = await new Promise(function (resolve, reject) {
                    UsrModel.read("/USER_ADDRSet", {
                        //urlParameters: {
                        //  "$top" : 1
                        //},
                        success: (oData) => {
                            //alert(oData.results[0].Accm);
                            //alert(oResponse);
                            resolve({ result: "SUCCESS", data: oData });
                            var UsrData = oData;
                            var UsrResp = oResponse;

                            //#endregion
                        },

                        error: (oData) => {
                            var usrError = ("Conection Error\n\r" + "URL: " + oData.response.requestUri.valueOf(Text) + "\n\rStatus: " + oData.response.statusCode.valueOf(Text) + "\n\rBody:" + oData.response.body.valueOf(Text));
                            resolve({ result: "ERROR", data: usrError });
                            reject(oData);
                            //MessageBox.error(usrError);

                        },

                    });

                });
                //data = oPromise.results;
                return [oPromise];

            },
            getWcdSrv: async function (UsrModel, data) {
                //Esto sirve para saber si una variables ya esta definida
                var resolve = "";
                var reject = "";
                const oPromise = await new Promise(function (resolve, reject) {
                    UsrModel.read("/WcdByDivision", {
                        urlParameters: {
                            "Div": "'WRSC'"
                            //"$top" : 1
                        },
                        success: (oData) => {
                            //alert(oData.results[0].Accm);
                            //alert(oResponse);
                            resolve({ result: "SUCCESS", data: oData });
                            var UsrData = oData;
                            var UsrResp = oResponse;

                            //#endregion
                        },

                        error: (oData) => {
                            var usrError = ("Conection Error\n\r" + "URL: " + oData.response.requestUri.valueOf(Text) + "\n\rStatus: " + oData.response.statusCode.valueOf(Text) + "\n\rBody:" + oData.response.body.valueOf(Text));
                            resolve({ result: "ERROR", data: usrError });
                            reject(oData);
                            //MessageBox.error(usrError);

                        },


                    });

                });
                //data = oPromise.results;
                return [oPromise];

            },
            getPusRepSrv: async function (UsrModel, data) {
                //Esto sirve para saber si una variables ya esta definida
                var resolve = "";
                var reject = "";
                const oPromise = await new Promise(function (resolve, reject) {
                    UsrModel.read("/UnitStatDivision", {
                        urlParameters: {
                            "Divis": "'WRSC'"
                            //"$top" : 1
                        },
                        success: (oData) => {
                            //alert(oData.results[0].Accm);
                            //alert(oResponse);
                            resolve({ result: "SUCCESS", data: oData });
                            var UsrData = oData;
                            var UsrResp = oResponse;

                            //#endregion
                        },

                        error: (oData) => {
                            var usrError = ("Conection Error\n\r" + "URL: " + oData.response.requestUri.valueOf(Text) + "\n\rStatus: " + oData.response.statusCode.valueOf(Text) + "\n\rBody:" + oData.response.body.valueOf(Text));
                            resolve({ result: "ERROR", data: usrError });
                            reject(oData);
                            //MessageBox.error(usrError);

                        },


                    });

                });
                //data = oPromise.results;
                return [oPromise];

            },
            getRmrksSrv: async function (UsrModel, data) {
                //Esto sirve para saber si una variables ya esta definida
                var resolve = "";
                var reject = "";
                const oPromise = await new Promise(function (resolve, reject) {
                    UsrModel.read("/ZWCM_MC_WRST_REMARKSSet", {
                        // urlParameters: {
                        //"Divis": "'WRSJ'"
                        //"$top" : 1
                        //},
                        success: (oData) => {
                            //alert(oData.results[0].Accm);
                            //alert(oResponse);
                            resolve({ result: "SUCCESS", data: oData });
                            var UsrData = oData;
                            var UsrResp = oResponse;

                            //#endregion
                        },

                        error: (oData) => {
                            var usrError = ("Conection Error\n\r" + "URL: " + oData.response.requestUri.valueOf(Text) + "\n\rStatus: " + oData.response.statusCode.valueOf(Text) + "\n\rBody:" + oData.response.body.valueOf(Text));
                            resolve({ result: "ERROR", data: usrError });
                            reject(oData);
                            //MessageBox.error(usrError);

                        },


                    });

                });
                //data = oPromise.results;
                return [oPromise];

            },
            postRmrksSrv: async function (UsrModel, data) {
                //Esto sirve para saber si una variables ya esta definida
                var resolve = "";
                var reject = "";
                const oPromise = await new Promise(function (resolve, reject) {
                    UsrModel.create("/ZWCM_MC_WRST_REMARKSSet", data, {
                        // urlParameters: {
                        //"Divis": "'WRSJ'"
                        //"$top" : 1
                        //},
                        method: "POST",
                        success: (oData) => {
                            //alert(oData.results[0].Accm);
                            //alert(oResponse);
                            resolve({ result: "SUCCESS", data: oData });
                            var UsrData = oData;
                            var UsrResp = oResponse;

                            //#endregion
                        },

                        error: (oData) => {
                            var usrError = ("Conection Error\n\r" + "URL: " + oData.response.requestUri.valueOf(Text) + "\n\rStatus: " + oData.response.statusCode.valueOf(Text) + "\n\rBody:" + oData.response.body.valueOf(Text));
                            resolve({ result: "ERROR", data: usrError });
                            reject(oData);
                            //MessageBox.error(usrError);

                        },


                    });

                });
                //data = oPromise.results;
                return [oPromise];

            },
            getMidNgthConSrv: async function (UsrModel, data) {
                //Esto sirve para saber si una variables ya esta definida
                var resolve = "";
                var reject = "";
                const oPromise = await new Promise(function (resolve, reject) {
                    UsrModel.read("/ZSWCM_MC_WRSTSet", {
                        // urlParameters: {
                        //"Divis": "'WRSJ'"
                        //"$top" : 1
                        //},
                        success: (oData) => {
                            //alert(oData.results[0].Accm);
                            //alert(oResponse);
                            resolve({ result: "SUCCESS", data: oData });
                            var UsrData = oData;
                            var UsrResp = oResponse;

                            //#endregion
                        },

                        error: (oData) => {
                            var usrError = ("Conection Error\n\r" + "URL: " + oData.response.requestUri.valueOf(Text) + "\n\rStatus: " + oData.response.statusCode.valueOf(Text) + "\n\rBody:" + oData.response.body.valueOf(Text));
                            resolve({ result: "ERROR", data: usrError });
                            reject(oData);
                            //MessageBox.error(usrError);

                        },


                    });

                });
                //data = oPromise.results;
                return [oPromise];

            },
            postMidNgthConSrv: async function (UsrModel, data) {
                //Esto sirve para saber si una variables ya esta definida
                var resolve = "";
                var reject = "";
                const oPromise = await new Promise(function (resolve, reject) {
                    UsrModel.create("/ZSWCM_MC_WRSTSet", data, {
                        // urlParameters: 
                        //"Divis": "'WRSJ'"
                        //"$top" : 1
                        //},
                        method: "POST",
                        success: (oData, oResponse) => {
                            //alert(oData.results[0].Accm);
                            //alert(oResponse);
                            resolve({ result: "SUCCESS", data: oResponse });
                            var UsrData = oData;
                            var UsrResp = oResponse;

                            //#endregion
                        },

                        error: (oData) => {
                            var usrError = ("Conection Error\n\r" + "URL: " + oData.response.requestUri.valueOf(Text) + "\n\rStatus: " + oData.response.statusCode.valueOf(Text) + "\n\rBody:" + oData.response.body.valueOf(Text));
                            resolve({ result: "ERROR", data: usrError });
                            reject(oData);
                            //MessageBox.error(usrError);

                        },


                    });

                });
                //data = oPromise.results;
                return [oPromise];

            },
            SetData: function (userData, wcdData, plantData, rmrksData, MidCondData, date, model, McDate) {

                var oView = this.getView("Index");
                var dataModel = model;
                var ctrllr = oView.getController();
                var obj = "";
                var UsrData = userData[0].data.results[0];
                dataModel.setProperty("/valDate", date);
                dataModel.setProperty("/valOpName", userData[0].data.results[0].NameTextc);
                dataModel.setProperty("/valUsrName", UsrData.Bname);
                dataModel.setProperty("/valMcdate", McDate);
                dataModel.setProperty("/valMandt", MidCondData[0].data.results[0].Mandt);

                //#region Jurisdiction and Control
                // obj = oView.byId("ipt_JurCtrlChk21");
                //dataModel.setProperty("/valJurCtrlChk", ctrllr.InitialFormat(obj.data().digitsallowed,
                //   obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, "",
                //  MidCondData[0].data.results[0].Ckinf));
                //dataModel.setProperty("/valJurCtrlChk", MidNgthConSrv[0].data.results[0].Ckinf);

                switch (MidCondData[0].data.results[0].Cacin) {
                    case "SFD":
                        dataModel.setProperty("/valcbxJurCtrl", "keyJcChk1");
                        break;
                    case "POC":
                        dataModel.setProperty("/valcbxJurCtrl", "keyJcChk2");
                        break;
                    default:
                        dataModel.setProperty("/valcbxJurCtrl", "");
                        break;
                }
                //#endregion Jurisdiction and Control

                //#region Security threat levels
                var iconSec = oView.byId("SecThr_color");
                var iconDWR = oView.byId("SecDwr_color");
                switch (MidCondData[0].data.results[0].Natsec) {
                    case "NORMAL":
                        dataModel.setProperty("/valSecThrLvNat", "keyStlNat1");
                        iconSec.setBackgroundColor("green");
                        iconSec.setColor("green");
                        break;
                    case "ELEVATED":
                        dataModel.setProperty("/valSecThrLvNat", "keyStlNat2");
                        iconSec.setBackgroundColor("orange");
                        iconSec.setColor("orange");
                        break;
                    case "IMMINENT":
                        dataModel.setProperty("/valSecThrLvNat", "keyStlNat3");
                        iconSec.setBackgroundColor("red");
                        iconSec.setColor("red");
                        break;
                    default:
                        dataModel.setProperty("/valSecThrLvNat", "");
                        break;
                }

                switch (MidCondData[0].data.results[0].Dwrsec) {
                    case "NORMAL":
                        dataModel.setProperty("/valSecThrLvDwr", "keyStlDwr1");
                        iconDWR.setBackgroundColor("green");
                        iconDWR.setColor("green");
                        //var lbl = view.byId("lbl_SecThreatLvls_dwr_color");
                        //lbl.addStyleClass("cbx_green");
                        break;
                    case "ELEVATED":
                        dataModel.setProperty("/valSecThrLvDwr", "keyStlDwr2");
                        iconDWR.setBackgroundColor("orange");
                        iconDWR.setColor("orange");
                        //var lbl = view.byId("lbl_SecThreatLvls_dwr_color");
                        //lbl.addStyleClass("cbx_orange");
                        break;
                    case "IMMINENT":
                        dataModel.setProperty("/valSecThrLvDwr", "keyStlDwr3");
                        iconDWR.setBackgroundColor("red");
                        iconDWR.setColor("red");
                        //var lbl = view.byId("lbl_SecThreatLvls_dwr_color");
                        //lbl.addStyleClass("cbx_red");
                        break;

                    default:
                        dataModel.setProperty("/valSecThrLvDwr", "");
                        iconDWR.setBackgroundColor("");
                        iconDWR.setColor("");
                        break;
                }
                //#endregion Security threath levels

                //#region Flows
                obj = oView.byId("iptFlowsProj");
                var objfocus = obj.getFocusInfo();
                objfocus.cursorPos = 2;
                objfocus.selectionEnd = 2;
                obj.applyFocusInfo(objfocus);



                dataModel.setProperty("/valFlowsProj", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign, MidCondData[0].data.results[0].Pwi));

                obj = oView.byId("iptFlows4358");
                dataModel.setProperty("/valFlows4358", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign, MidCondData[0].data.results[0].Etp4348));

                obj = oView.byId("iptFlows5966");
                dataModel.setProperty("/valFlows5966", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign, MidCondData[0].data.results[0].Etp5966));

                obj = oView.byId("iptFlowsTehach");
                dataModel.setProperty("/valFlowsTehach", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign, MidCondData[0].data.results[0].Teabf));

                obj = oView.byId("iptFlowsPyramid");
                dataModel.setProperty("/valFlowsPyramid", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign, MidCondData[0].data.results[0].Srfp));

                obj = oView.byId("iptFlowsCastaic");
                dataModel.setProperty("/valFlowsCastaic", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign, MidCondData[0].data.results[0].Srfcd));

                obj = oView.byId("iptFlowsCedar");
                dataModel.setProperty("/valFlowsCedar", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign, MidCondData[0].data.results[0].Srfcsd));

                obj = oView.byId("iptFlowsPerris");
                dataModel.setProperty("/valFlowsPerris", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign, MidCondData[0].data.results[0].Srfpls));

                switch (MidCondData[0].data.results[0].Pss) {
                    case "DC A/B #1":
                        dataModel.setProperty("/valPipeSapl", "key1");
                        break;
                    case "DC A/B #2":
                        dataModel.setProperty("/valPipeSapl", "key2");
                        break;
                    default:
                        dataModel.setProperty("/valPipeSapl", "");
                        break;
                }

                obj = oView.byId("iptPipeSaplCfs");
                dataModel.setProperty("/valPipeSaplCfs", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign, MidCondData[0].data.results[0].Psscfs));

                switch (MidCondData[0].data.results[0].Infd) {

                    case "DC A/B #2":
                        dataModel.setProperty("/valPipeInland", "key1");
                        break;
                    default:
                        dataModel.setProperty("/valPipeInland", "");
                        break;
                }

                obj = oView.byId("iptPipeInlandCfs");
                dataModel.setProperty("/valPipeInlandCfs", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign, MidCondData[0].data.results[0].Infdcfs));

                switch (MidCondData[0].data.results[0].Psr) {
                    case "DC A/B #1":
                        dataModel.setProperty("/valPipeRialto", "key1");
                        break;
                    case "DC A/B #2":
                        dataModel.setProperty("/valPipeRialto", "key2");
                        break;
                    default:
                        dataModel.setProperty("/valPipeRialto", "");
                        break;
                }

                obj = oView.byId("iptPipeRialtoCfs");
                dataModel.setProperty("/valPipeRialtoCfs", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign, MidCondData[0].data.results[0].Psrcfs));

                obj = oView.byId("iptPipeLasFlores");
                dataModel.setProperty("/valPipeLasFlores", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign, MidCondData[0].data.results[0].Psl));
                //#endregion Flows

                //#region Intake Tower Status


                switch (MidCondData[0].data.results[0].Icli) {
                    case "OPEN":
                        dataModel.setProperty("/valIntakeCastaic", "key1");
                        break;
                    case "CLOSED":
                        dataModel.setProperty("/valIntakeCastaic", "key2");
                        break;
                    default:
                        dataModel.setProperty("/valIntakeCastaic", "");
                        break;
                }

                dataModel.setProperty("/valIntakeCastaicRmrk", rmrksData[0].data.results[0].Icvo);
                dataModel.setProperty("/valIntakeSanBerRmrk", rmrksData[0].data.results[0].Islo);
                dataModel.setProperty("/valIntakePerrisRmrk", rmrksData[0].data.results[0].Ipvo);
                //#endregion Intake Tower Status

                //#region ALPP

                dataModel.setProperty("/valAlppRmrk", rmrksData[0].data.results[0].Alppp);

                //#endregion ALPP

                //#region PBPP
                obj = oView.byId("iptPbppFbay");
                dataModel.setProperty("/valPbppFbay", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign, MidCondData[0].data.results[0].Pbppf));

                dataModel.setProperty("/valPbppRmrk", rmrksData[0].data.results[0].Pbppp);
                //#endregion PBPP

                //#region MJPP

                obj = oView.byId("iptMjppFbay");
                dataModel.setProperty("/valMjppFbay", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign, MidCondData[0].data.results[0].Mjppf));

                obj = oView.byId("iptMjppSilver");
                dataModel.setProperty("/valMjppSilver", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign, MidCondData[0].data.results[0].Mjpps));

                dataModel.setProperty("/valMjppRmrk", rmrksData[0].data.results[0].Mjppps);

                //#endregion MJPP

                //#region DCPP
                if (MidCondData[0].data.results[0].Uiic1 == "1") {
                    obj = oView.byId("chk_DcppIso1").setSelected(true);
                    dataModel.setProperty("/val_DcppIso1", "1");
                }
                else {
                    obj = oView.byId("chk_DcppIso1").setSelected(false);
                    dataModel.setProperty("/val_DcppIso1", "0");
                }

                if (MidCondData[0].data.results[0].Uiic2 == "1") {
                    obj = oView.byId("chk_DcppIso2").setSelected(true);
                    dataModel.setProperty("/val_DcppIso2", "1");
                }
                else {
                    obj = oView.byId("chk_DcppIso2").setSelected(false);
                    dataModel.setProperty("/val_DcppIso2", "0");
                }

                if (MidCondData[0].data.results[0].Uiic3 == "1") {
                    obj = oView.byId("chk_DcppIso3").setSelected(true);
                    dataModel.setProperty("/val_DcppIso3", "1");
                }
                else {
                    obj = oView.byId("chk_DcppIso3").setSelected(false);
                    dataModel.setProperty("/val_DcppIso3", "0");
                }

                if (MidCondData[0].data.results[0].Uiic4 == "1") {
                    obj = oView.byId("chk_DcppIso4").setSelected(true);
                    dataModel.setProperty("/val_DcppIso4", "1");
                }
                else {
                    obj = oView.byId("chk_DcppIso4").setSelected(false);
                    dataModel.setProperty("/val_DcppIso4", "0");
                }

                obj = oView.byId("iptDcppAfter1");
                dataModel.setProperty("/valDcppAfter1", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign, MidCondData[0].data.results[0].Abn1e));

                obj = oView.byId("iptDcppAfter2");
                dataModel.setProperty("/valDcppAfter2", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign, MidCondData[0].data.results[0].Abn2e));

                dataModel.setProperty("/valDcppSAPL", MidCondData[0].data.results[0].Saplff)

                obj = oView.byId("iptDcppSAPLCfs");
                dataModel.setProperty("/valDcppSAPLCfs", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign, MidCondData[0].data.results[0].Saplffcfs));

                dataModel.setProperty("/valDcppInland", MidCondData[0].data.results[0].Infdff)

                obj = oView.byId("iptDcppInlandCfs");
                dataModel.setProperty("/valDcppInlandCfs", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign, MidCondData[0].data.results[0].Infdffcfs));

                dataModel.setProperty("/valDcppRialto", MidCondData[0].data.results[0].Sjrff)

                obj = oView.byId("iptDcppRialtoCfs");
                dataModel.setProperty("/valDcppRialtoCfs", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign, MidCondData[0].data.results[0].Sjrffcfs));

                dataModel.setProperty("/valDcppRmrk", rmrksData[0].data.results[0].Dcpppscne);
                //#endregion DCPP

                //#region GSPP
                dataModel.setProperty("/valGsppRmrk", rmrksData[0].data.results[0].Gspppscne);
                //#endregion GSPP

                //#region CHPP
                dataModel.setProperty("/valChppRmrk", rmrksData[0].data.results[0].Chpppscne);
                //#endregion CHPP

                //#region CVPP
                dataModel.setProperty("/valCvppRmrk", rmrksData[0].data.results[0].Cypppscne);
                //#endregion CVPP

                //#region OSPP
                obj = oView.byId("iptOsppFbay");
                dataModel.setProperty("/valOsppFbay", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign, MidCondData[0].data.results[0].Osppfe));

                dataModel.setProperty("/valOsppRmrk", rmrksData[0].data.results[0].Ospppscne);
                //#endregion OSPP

                //#region WWPP
                obj = oView.byId("iptWwppFbay");
                dataModel.setProperty("/valWwppFbay", ctrllr.InitialFormat(obj.data().digitsallowed,
                    obj.data().error, obj.data().decAllwd, obj.data().name, obj.data().val, obj.data().sign, MidCondData[0].data.results[0].Wwppfe));

                dataModel.setProperty("/valWwppRmrk", rmrksData[0].data.results[0].Wwpppscne);
                //#endregion WWPP

                //#region Report Tables

                dataModel.setProperty("/val_wcd_table", wcdData[0].data.results);
                dataModel.setProperty("/val_plntt", plantData[0].data.results);



                //#endregion Report Tables
                return dataModel;
            },
            addEvent: function (ObName, ObId, Oval, dec) {
                var oJSONModel = new sap.ui.model.json.JSONModel();
                var oView = this.getView("Index");
                var oModel = oView.getModel();
                var oData = oModel.getData();
                oModel.setData(null);

                ObName.addEventDelegate({
                    onfocusout: $.proxy(function (oEvent) {
                        if (dec !== "0") {
                            var idx = 0;
                            var val;
                            var obj = this.byId(ObId);
                            var value = obj.getValue();
                            var last_ch = value.substring((value.length - 1));
                            if (last_ch === '.') {
                                //obj.setValue(value.substring((value.length - 1), 0));
                                while (idx < dec) {
                                    oData[Oval] = value + "0";
                                    value = oData[Oval];
                                    idx++;
                                }
                                //var error = "The maximum allowed limit for 'Alameda Country' is a 4 digit number with a single decimal place. \n\r Please enter a proper value. ";
                                //sap.m.MessageBox.error(error);
                            }
                            else {
                                if (value.includes(".")) {
                                    var values = value.split(".")
                                    val = (values[1].length);
                                    idx = val;
                                }

                                while (idx < dec) {
                                    if (idx === 0) {
                                        oData[Oval] = value + ".0";
                                    }
                                    else {
                                        oData[Oval] = value + "0";
                                    }

                                    value = oData[Oval];
                                    idx++;
                                }
                            }

                        }
                        if (value.substring(0, 1) === ".") {
                            oData[Oval] = "0" + oData[Oval];
                        }

                        //Delete leading Zero
                        // if (value.length > 0) {
                        //     var firschr = value.toString().substring(0, 1);
                        //     if (firschr === "0") {
                        //         oData[Oval] = value.toString().substring(1, (value.length));
                        //     }
                        // }

                        oModel.setData(oData);
                        oView.setModel(oModel);

                    }, this)
                });
                oModel.setData(oData);
                oView.setModel(oModel);
            },
            getDecAll: function (Object) {
                var param = Object.getCustomData();
                var decAll = 0;
                for (let index = 0; index < param.length; index++) {
                    const element = param[index];
                    if (element.getProperty("key") === "decAllwd") {
                        decAll = Number(element.getProperty("value"));
                        break;
                    }
                }
                return decAll;
            },

            InitialFormat: function (digAll, err, decall, name, val, psign, pValue) {

                //Para obtener los parámetros enviados en el eventhandler(evt), esto nos servirá para
                //Crear el objeto formateador
                var dig = digAll;     //Número de dígitos permitidos
                var id = err;              //Texto identificador del mensaje de error
                var decAllwd = decall;     //Número de decimales permitidos
                var obj_name = name;         //Nombre del objeto que dispara el evento
                var obj_valId = val;         //Nombre de la variable que contiene el valor
                var sign_allwd = psign;       //Indica que el campo acepta signos + o -
                var flag_dec = "";                                   //Flag para saber si contiene decimales
                var sign = "";                                       //Para considerar signos.
                //#region Variables para calculo de diferencia
                var prevDaySchAllaf = 0;
                var prevday = 0;
                var dif = 0;
                var dif_val = 0;
                var netValInt = 0;
                var netValDec = 0;
                var flag = "";
                var values;
                //#endregion
                //------------------------------------

                //Se crea un objeto de tipo formateador, el cual sirve para aplicar el formato requerido al objeto
                var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                    //Número de decimales permitidos, en este caso solo queremos números enteros
                    maxFractionDigits: decAllwd,
                    //Se agrupan los números, en este caso de 3 en 3
                    groupingEnabled: true,
                    //Separados de grupos
                    groupingSeparator: ",",
                    //Separador para decimales
                    decimalSeparator: ".",
                    //Número máximo de dígitos permitidos
                    maxIntegerDigits: dig
                });

                //-------------------------------------------

                //Se crea el modelo json que nos servirá para recuperar y mandar valores a los objetos de la vista
                //Se obtiene la vista, lo cual nos da acceso a todos los componentes en ella.
                var vistaOnChange = this.getView("Index");
                //var oJSONModel = new sap.ui.model.json.JSONModel();
                var Modelo_vista = vistaOnChange.getModel();
                //var json_datos = Modelo_vista.getData();
                var oJSON = {};

                //Se obtiene la fuente (objeto) que disparó el evento y a continuación el valor de dicho objeto
                var value = pValue //vistaOnChange.byId([obj_name]).getValue();
                //Modelo_vista.setData(null);

                //if (typeof IntDec === "undefined") {
                //Esto sirve para saber si una variables ya esta definida
                //}

                //----------------------------
                if ((value.substring(0, 1).includes("+") || value.substring(0, 1).includes("-")) && sign_allwd === "X") {
                    switch (value.substring(0, 1)) {
                        case "+":
                            sign = "+";
                            break;
                        case "-":
                            sign = "-";
                            break;
                        default:
                            break;
                    }

                }
                //Verificamos si el valor contiene . decimal
                if (value.includes(".")) {
                    //Si se encontró el . decimal entonces separamos enteros de decimales en un array
                    var IntDec = value.split('.');

                    //Nos aseguramos de que solo existan dígitos tanto en los enteros como en los decimales
                    var netvalueint = IntDec[0].replace(/[^\d]/g, "");//Regex muy simple si encuentra "," en cualquier parte del valor, lo reemplaza o en este caso lo elimina.
                    var netvaluedec = IntDec[1].replace(/[^\d]/g, "");
                    flag_dec = "X";
                }
                //Si no se encuentra . decimale entonces tomamos el valor enviado por el usuario
                else {
                    //Nos aseguramos de que solo existan dígitos
                    var value = value.replace(/[^\d]/g, "");//Regex muy simple si encuentra "," en cualquier parte del valor, lo reemplaza o en este caso lo elimina.
                    flag_dec = "";
                }


                //---------------------------------

                //Verificamos que los enteros no excedan el valor indicado de digitos permitidos ()
                //Se verifica si la variante netvaluint esta definida(se encontró . decimal y se realizó el split)
                if (typeof netvalueint !== "undefined") {
                    // Si esta definida hay punto decimal y por l tanto usamos el valor recuperado de la vista
                    if (netvalueint.length > dig) {
                        //Si se sobrepaso el número de dígitos permitidos se lanza msg de error.
                        if (decAllwd > 0) {
                            var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                " digit number with " + decAllwd + " decimal places." + "\n\r Please enter a proper value.";
                            oJSON[obj_valId] = "0";

                            format_value = "0";
                            //values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                            //this.dif_cal(json_datos, flag, prevday, prevDaySchAllaf, dif_val,values, netValInt, netValDec,oNumberFormat, dif)


                            //Modelo_vista.setData(json_datos);//se envía el objeto json al modelo json creado previamente
                            //Modelo_vista.updateBindings(true);
                            //vistaOnChange.setModel(Modelo_vista);//Se modifican los datos de la vista por medio del modelo json.
                        }
                        else {
                            var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                " digit number." + "\n\r Please enter a proper value.";
                            oJSON[obj_valId] = "0";
                            format_value = "0";
                            //values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                            //this.dif_cal(json_datos, flag, prevday, prevDaySchAllaf, dif_val,values, netValInt, netValDec,oNumberFormat, dif)

                            //Modelo_vista.setData(json_datos);//se envía el objeto json al modelo json creado previamente
                            //Modelo_vista.updateBindings(true);
                            //vistaOnChange.setModel(Modelo_vista);//Se modifican los datos de la vista por medio del modelo json.
                        }
                        sap.m.MessageBox.error(msgerror);
                    }
                    else {
                        //Verificamos que la variable contenga valores, en este punto deberian ser dígitos o null o podría ser "" por q se ingresó
                        //un . decimal como primer caracter
                        if (netvalueint !== null & netvalueint !== "") {

                            //Verificamos si existen valores en la parte decimal
                            if (netvaluedec !== null & netvaluedec !== "") {
                                //Si hay decimales se concatenan a los enteros y se formatea
                                value = netvalueint + '.' + netvaluedec;
                                var format_value = sign + oNumberFormat.format(value);
                            }
                            else {
                                //Si no hay decimales se formatean solo los enteros

                                var format_value = oNumberFormat.format(netvalueint);
                                //Se agrega el punto decimal 
                                format_value = sign + format_value + '.';
                            }
                        }
                        else {
                            //No se encontraron valores enteros
                            //Se verifica si hay valores decimales
                            if (netvaluedec !== null & netvaluedec !== "") {
                                value = '.' + netvaluedec;
                                var format_value = sign + oNumberFormat.format(value);
                            }
                            else {
                                // no hay decimales, se devuelve el punto decimal.
                                var format_value = sign + '.';
                            }
                        }
                    }
                }
                //Si no se realizó el split se usa el valor recuperado de la vista (value)
                else {
                    if (value.length > dig) {
                        //Si se sobrepaso el número de dígitos permitidos se lanza msg de error.
                        if (decAllwd > 0) {
                            var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                " digit number with " + decAllwd + " decimal places." + "\n\r Please enter a proper value.";
                            oJSON[obj_valId] = "0";
                            format_value = "0";
                            //values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                            //this.dif_cal(json_datos, flag, prevday, prevDaySchAllaf, dif_val,values, netValInt, netValDec,oNumberFormat, dif)


                            //Modelo_vista.setData(json_datos);//se envía el objeto json al modelo json creado previamente
                            //Modelo_vista.updateBindings(true);
                            //vistaOnChange.setModel(Modelo_vista);//Se modifican los datos de la vista por medio del modelo json.
                        }
                        else {
                            var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                " digit number. " + "\n\r Please enter a proper value.";
                            oJSON[obj_valId] = "0";
                            format_value = "0";
                            // values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                            //this.dif_cal(json_datos, flag, prevday, prevDaySchAllaf, dif_val,values, netValInt, netValDec,oNumberFormat, dif)

                            //Modelo_vista.setData(json_datos);//se envía el objeto json al modelo json creado previamente
                            //Modelo_vista.updateBindings(true);
                            //vistaOnChange.setModel(Modelo_vista);//Se modifican los datos de la vista por medio del modelo json.
                        }
                        sap.m.MessageBox.error(msgerror);
                    }
                    else {
                        if (value !== "") {
                            var format_value = sign + oNumberFormat.format(value);
                        }
                        else {
                            var format_value = sign + "";
                        }

                    }
                }

                //Se crea el objeto json que contiene los objetos que necesitamos modificar 

                //oJSONModel.getProperty("/cbx_secThr_Lvl_class");
                //oJSONModel.setProperty("/cbx_secThr_Lvl_class","cbx_green");
                //oModel.setData(modelData);

                // oJSONModel.setData(oJSON);//se envía el objeto json al modelo json creado previamente
                //oView.setModel(oJSONModel);//Se modifican los datos de la vista por medio del modelo json. 

                oJSON[(obj_valId)] = format_value;

                if (obj_name === "ipt_CliftCourt2_PrevDay_DA" || obj_name === "ipt_CliftCourt_PrevDay_SAAf") {


                    //values = this.number_val(oJSON.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                    //this.dif_cal(oJSON, flag, prevday, prevDaySchAllaf, dif_val, values, netValInt, netValDec, oNumberFormat, dif)
                }
                //Cuando se modifique el valor del campo Prev. Day Scheduled Allotment, se calcula el valor del campo
                //Prev. Day Scheduled AllotmentAF
                if (obj_name === "ipt_CliftCourt4_PrevDay_SA") {
                    //Se crea un objeto de tipo formateador, el cual sirve para aplicar el formato requerido al objeto
                    var oNumberFormat1 = sap.ui.core.format.NumberFormat.getFloatInstance({
                        //Número de decimales permitidos, en este caso solo queremos números enteros
                        maxFractionDigits: 0,
                        //Se agrupan los números, en este caso de 3 en 3
                        groupingEnabled: true,
                        //Separados de grupos
                        groupingSeparator: ",",
                        //Separador para decimales
                        decimalSeparator: "",
                        //Número máximo de dígitos permitidos
                        maxIntegerDigits: 6,
                        //roundingMode: "TOWARDS_ZERO"
                    });
                    //var calc = value * 1.9835;
                    //oJSON.val_CliftCourt_af = oNumberFormat1.format(calc);
                    //json_datos.val_CliftCourt_af = Math.round(calc);
                    //json_datos.val_CliftCourt_af = json_datos.val_CliftCourt_af.toString();

                    //values = this.number_val(oJSON.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                    //this.dif_cal(oJSON, flag, prevday, prevDaySchAllaf, dif_val, values, netValInt, netValDec, oNumberFormat, dif)

                }
                if (obj_name === "ipt_DvppArrMtr" || obj_name === "ipt_DvppRelInAq") {
                    var oNumberFormatDvpp = sap.ui.core.format.NumberFormat.getFloatInstance({
                        //Número máximo de dígitos permitidos
                        maxIntegerDigits: 9,
                        //Número de decimales permitidos, en este caso solo queremos números enteros
                        maxFractionDigits: 0,
                        //Se agrupan los números, en este caso de 3 en 3
                        groupingEnabled: true,
                        //Separados de grupos
                        groupingSeparator: ",",
                        //Separador para decimales
                        decimalSeparator: "",

                    });
                    //var ArrMtr = Number(oJSON.val_dvpp_arrMtr);
                    //var Devria = Number(oJSON.val_dvpp_relIntoAqu);

                    //if (ArrMtr > 0) {
                    //  var total = ArrMtr + Devria;
                    // oJSON.val_sbpp_aquedBlend = oNumberFormatDvpp.format((ArrMtr * 100) / (ArrMtr + Devria).toString());
                    // }
                    //var aqBlend = 100 - Number(oJSON.val_sbpp_aquedBlend);
                    //oJSON.val_sbpp_dvRes = oNumberFormatDvpp.format(aqBlend.toString());

                }




                // }


                //oJSON.obj_valId = format_value;
                //oJSONModel.setProperty(obj_valId, format_value);
                //Modelo_vista.setData(json_datos);//se envía el objeto json al modelo json creado previamente
                //Modelo_vista.updateBindings(true);
                //vistaOnChange.setModel(Modelo_vista);//Se modifican los datos de la vista por medio del modelo json.
                return format_value;
            },
            OnCbxChng: function (evt) {
                var view = this.getView("Index");
                var model = view.getModel();
                var secIcon = view.byId(evt.getSource().data("icon"));
                var cbxId = evt.getSource().data("cbxName");
                var dataSrc = evt.getSource().data("dataSource");
                var selKey = evt.getSource().data("selkey");
                var cbx = view.byId([cbxId]);
                var cbxJson = view.getModel().getData();
                var list = cbxJson[dataSrc];
                var flag = "";

                for (let index = 0; index < list.length; index++) {
                    if (list[index].text === cbx.getValue()) {
                        flag = "X";
                        break;
                    }

                }
                if (flag === "") {

                    sap.m.MessageBox.error("Select a valid value.");
                    cbxJson[selKey] = list[0].key.toString();
                    model.setData("");
                    model.setData(cbxJson);
                    view.setModel(model);
                }


                if (cbxId === "cbx_SecThreatLvls_nat" || cbxId === "cbx_SecThreatLvls_dwr") {
                    //Se obtiene la vista, lo cual nos da acceso a todos los componentes en ella.
                    //var oView = this.getView("View1");
                    //var model = oView.getModel();
                    //var json = model.getData();
                    //var cbx = oView.byId(evt.getSource().data("obj_name"));
                    var val = cbx._getSelectedItemText();

                    //lbl.removeStyleClass("cbx_green");
                    //lbl.removeStyleClass("cbx_orange");
                    //lbl.removeStyleClass("cbx_red");

                    switch (val) {
                        case "NORMAL":
                            // lbl.addStyleClass("cbx_green");
                            secIcon.setBackgroundColor("green");
                            secIcon.setColor("green");
                            break;
                        case "ELEVATED":
                            // lbl.addStyleClass("cbx_orange");
                            secIcon.setBackgroundColor("orange");
                            secIcon.setColor("orange");
                            break;
                        case "IMMINENT":
                            //lbl.addStyleClass("cbx_red");
                            secIcon.setBackgroundColor("red");
                            secIcon.setColor("red");
                            break;
                        default:
                            if (cbxId === "cbx_SecThreatLvls_nat")
                                model.setProperty("/valSecThrLvNat", "");
                            else {
                                model.setProperty("/valSecThrLvDwr", "");
                            }
                            secIcon.setBackgroundColor("");
                            secIcon.setColor("");

                            break;
                    }
                }
                if (cbxId === "cbxPipeSapl") {
                    var val = cbx._getSelectedItemText();
                    model.setProperty("/valDcppSAPL", val);
                }

                if (cbxId === "cbxPipeInland") {
                    var val = cbx._getSelectedItemText();
                    model.setProperty("/valDcppInland", val);
                }

                if (cbxId === "cbxPipeRialto") {
                    var val = cbx._getSelectedItemText();
                    model.setProperty("/valDcppRialto", val);
                }
                //if (cbx.value() && cbx.selectedIndex == -1) {
                //var dt = this.dataSource._data[0];
                //  cbx.text("");


            },
            onClear: function (evt) {
                /**var fid = evt.getSource().getId();
                var id = fid.split(/--/)
                var idt = id[2];
                idt = "ipt"+idt.substring(3,idt.length); TODO ESTO SE REEMPLAZA POR PARAMETRO*/
                var objid = evt.getSource().data("id");//Se obtiene el valor del parámetro enviado desde la vista "id"
                this.getView("View1").byId(objid).setValue("");
            },
            OnLiveChgEvt: function (evt) {

                //Para obtener los parámetros enviados en el eventhandler(evt), esto nos servirá para
                //Crear el objeto formateador
                var dig = evt.getSource().data("digitsallowed");     //Número de dígitos permitidos
                var id = evt.getSource().data("error");              //Texto identificador del mensaje de error
                var decAllwd = evt.getSource().data("decAllwd");     //Número de decimales permitidos
                var obj_name = evt.getSource().data("name");         //Nombre del objeto que dispara el evento
                var obj_valId = evt.getSource().data("val");         //Nombre de la variable que contiene el valor
                var sign_allwd = evt.getSource().data("sign");       //Indica que el campo acepta signos + o -
                var flag_dec = "";                                   //Flag para saber si contiene decimales
                var sign = "";                                       //Para considerar signos.
                //#region Variables para calculo de diferencia
                var prevDaySchAllaf = 0;
                var prevday = 0;
                var dif = 0;
                var dif_val = 0;
                var netValInt = 0;
                var netValDec = 0;
                var flag = "";
                var values;
                var obj = this.byId(obj_name);
                //#endregion
                //------------------------------------

                //Se crea un objeto de tipo formateador, el cual sirve para aplicar el formato requerido al objeto
                var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                    //Número de decimales permitidos, en este caso solo queremos números enteros
                    maxFractionDigits: decAllwd,
                    //Se agrupan los números, en este caso de 3 en 3
                    groupingEnabled: true,
                    //Separados de grupos
                    groupingSeparator: ",",
                    //Separador para decimales
                    decimalSeparator: ".",
                    //Número máximo de dígitos permitidos
                    maxIntegerDigits: dig
                });

                //-------------------------------------------

                //Se crea el modelo json que nos servirá para recuperar y mandar valores a los objetos de la vista
                //Se obtiene la vista, lo cual nos da acceso a todos los componentes en ella.
                var vistaOnChange = this.getView("Index");
                //var oJSONModel = new sap.ui.model.json.JSONModel();
                var Modelo_vista = vistaOnChange.getModel();
                var json_datos = Modelo_vista.getData();

                //var newValue = obj.getValue();
                //var lastValue = obj.getLastValue();

                //Se obtiene la fuente (objeto) que disparó el evento y a continuación el valor de dicho objeto
                var value = evt.getSource().getValue();
                Modelo_vista.setData(null);

                //if (typeof IntDec === "undefined") {
                //Esto sirve para saber si una variables ya esta definida
                //}

                //----------------------------
                if ((value.substring(0, 1).includes("+") || value.substring(0, 1).includes("-")) && sign_allwd === "X") {
                    switch (value.substring(0, 1)) {
                        //case "+":
                        //  sign = "+";
                        //break;
                        case "-":
                            sign = "-";
                            break;
                        default:
                            break;
                    }

                }
                //Verificamos si el valor contiene . decimal
                if (value.includes(".")) {
                    //Si se encontró el . decimal entonces separamos enteros de decimales en un array
                    var IntDec = value.split('.');

                    //Nos aseguramos de que solo existan dígitos tanto en los enteros como en los decimales
                    var netvalueint = IntDec[0].replace(/[^\d]/g, "");//Regex muy simple si encuentra "," en cualquier parte del valor, lo reemplaza o en este caso lo elimina.
                    // if(decAllwd !=""){
                    var netvaluedec = IntDec[1].replace(/[^\d]/g, "");
                    flag_dec = "X";
                    //}
                    //else{

                }
                //Si no se encuentra . decimale entonces tomamos el valor enviado por el usuario
                else {
                    //Nos aseguramos de que solo existan dígitos
                    var value = value.replace(/[^\d]/g, "");//Regex muy simple si encuentra "," en cualquier parte del valor, lo reemplaza o en este caso lo elimina.
                    flag_dec = "";
                }
                if ((flag_dec === "X" && decAllwd != "") || flag_dec === "") {

                    //---------------------------------

                    //Verificamos que los enteros no excedan el valor indicado de digitos permitidos ()
                    //Se verifica si la variante netvaluint esta definida(se encontró . decimal y se realizó el split)
                    if (typeof netvalueint !== "undefined") {
                        // Si esta definida hay punto decimal y por l tanto usamos el valor recuperado de la vista
                        if (netvalueint.length > dig) {
                            //Si se sobrepaso el número de dígitos permitidos se lanza msg de error.
                            if (decAllwd > 0) {
                                if (decAllwd === "1") {
                                    var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                        " digit number with " + decAllwd + " decimal place." + "\n\r Please enter a proper value.";
                                    json_datos[obj_valId] = "";

                                    format_value = "";
                                }
                                else {
                                    var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                        " digit number with " + decAllwd + " decimal places." + "\n\r Please enter a proper value.";
                                    json_datos[obj_valId] = "";

                                    format_value = "";
                                }

                            }
                            else {
                                var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                    " digit number." + "\n\r Please enter a proper value.";
                                json_datos[obj_valId] = "";
                                format_value = "";
                            }
                            sap.m.MessageBox.error(msgerror);
                        }
                        else {
                            //Verificamos que la variable contenga valores, en este punto deberian ser dígitos o null o podría ser "" por q se ingresó
                            //un . decimal como primer caracter
                            if (netvalueint !== null & netvalueint !== "") {

                                //Verificamos si existen valores en la parte decimal
                                if ((netvaluedec !== null && netvaluedec !== "" && netvaluedec !== undefined)) {
                                    //Si hay decimales se concatenan a los enteros y se formatea
                                    value = netvalueint + '.' + netvaluedec;
                                    var format_value = sign + oNumberFormat.format(value);
                                }
                                else {
                                    //Si no hay decimales se formatean solo los enteros

                                    var format_value = oNumberFormat.format(netvalueint);
                                    //Se agrega el punto decimal 
                                    if (decAllwd != "") {
                                        format_value = sign + format_value + ".";
                                    }
                                    else {
                                        format_value = sign + format_value;
                                    }

                                }
                            }
                            else {
                                //No se encontraron valores enteros
                                //Se verifica si hay valores decimales
                                if (netvaluedec !== null & netvaluedec !== "") {
                                    value = '.' + netvaluedec;
                                    var format_value = sign + oNumberFormat.format(value);
                                }
                                else {
                                    // no hay decimales, se devuelve el punto decimal.
                                    var format_value = sign + '.';
                                }
                            }
                        }
                    }
                    //Si no se realizó el split se usa el valor recuperado de la vista (value)
                    else {
                        if (value.length > dig) {
                            //Si se sobrepaso el número de dígitos permitidos se lanza msg de error.
                            if (decAllwd > 0) {
                                if (decAllwd === "1") {
                                    var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                        " digit number with " + decAllwd + " decimal place." + "\n\r Please enter a proper value.";
                                    json_datos[obj_valId] = "";

                                    format_value = "";
                                }
                                else {
                                    var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                        " digit number with " + decAllwd + " decimal places." + "\n\r Please enter a proper value.";
                                    json_datos[obj_valId] = "";

                                    format_value = "";
                                }

                            }
                            else {
                                var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                    " digit number. " + "\n\r Please enter a proper value.";
                                json_datos[obj_valId] = "";
                                format_value = "";
                            }
                            sap.m.MessageBox.error(msgerror);
                        }
                        else {
                            if (value !== "") {
                                var format_value = sign + oNumberFormat.format(value);
                            }
                            else {
                                var format_value = sign + "";
                            }

                        }
                    }
                }
                else {
                    var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                        " digit number." + "\n\r Please enter a proper value.";
                    json_datos[obj_valId] = "";
                    format_value = ""; //oNumberFormat.format(netvalueint);
                    sap.m.MessageBox.error(msgerror);
                }

                json_datos[obj_valId] = format_value;

                if (obj_name === "ipt_CliftCourt2_PrevDay_DA" || obj_name === "ipt_CliftCourt_PrevDay_SAAf") {


                    values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                    this.dif_cal(json_datos, flag, prevday, prevDaySchAllaf, dif_val, values, netValInt, netValDec, oNumberFormat, dif)
                }
                //Cuando se modifique el valor del campo Prev. Day Scheduled Allotment, se calcula el valor del campo
                //Prev. Day Scheduled AllotmentAF
                if (obj_name === "ipt_CliftCourt4_PrevDay_SA") {
                    //Se crea un objeto de tipo formateador, el cual sirve para aplicar el formato requerido al objeto
                    var oNumberFormat1 = sap.ui.core.format.NumberFormat.getFloatInstance({
                        //Número de decimales permitidos, en este caso solo queremos números enteros
                        maxFractionDigits: 0,
                        //Se agrupan los números, en este caso de 3 en 3
                        groupingEnabled: true,
                        //Separados de grupos
                        groupingSeparator: ",",
                        //Separador para decimales
                        decimalSeparator: "",
                        //Número máximo de dígitos permitidos
                        maxIntegerDigits: 6,
                        //roundingMode: "TOWARDS_ZERO"
                    });
                    var valClifCrtAf = json_datos[obj_valId].replace(/,/g, "");

                    var calc = (Number(valClifCrtAf) * 1.9835).toString();
                    var PdIntDec = "";
                    if (calc.includes(".")) {
                        PdIntDec = calc.split('.');
                        json_datos.val_CliftCourt_af = oNumberFormat1.format(PdIntDec[0]);
                    }
                    else {
                        json_datos.val_CliftCourt_af = oNumberFormat1.format(calc);
                    }

                    values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                    this.dif_cal(json_datos, flag, prevday, prevDaySchAllaf, dif_val, values, netValInt, netValDec, oNumberFormat, dif)

                }
                if (obj_name === "ipt_DvppArrMtr" || obj_name === "ipt_DvppRelInAq") {
                    var oNumberFormatDvpp = sap.ui.core.format.NumberFormat.getFloatInstance({
                        //Número máximo de dígitos permitidos
                        maxIntegerDigits: 9,
                        //Número de decimales permitidos, en este caso solo queremos números enteros
                        maxFractionDigits: 0,
                        //Se agrupan los números, en este caso de 3 en 3
                        groupingEnabled: true,
                        //Separados de grupos
                        groupingSeparator: ",",
                        //Separador para decimales
                        decimalSeparator: "",

                    });
                    var ArrMtr = Number(json_datos.val_dvpp_arrMtr);
                    var Devria = Number(json_datos.val_dvpp_relIntoAqu);

                    if (ArrMtr > 0) {
                        var total = ArrMtr + Devria;
                        json_datos.val_sbpp_aquedBlend = oNumberFormatDvpp.format((ArrMtr * 100) / (ArrMtr + Devria).toString());
                    }
                    var aqBlend = 100 - Number(json_datos.val_sbpp_aquedBlend);
                    json_datos.val_sbpp_dvRes = oNumberFormatDvpp.format(aqBlend.toString());

                }

                if (obj_name === "iptPipeSaplCfs") {

                    json_datos.valDcppSAPLCfs = json_datos.valPipeSaplCfs;
                }

                if (obj_name === "iptPipeInlandCfs") {

                    json_datos.valDcppInlandCfs = json_datos.valPipeInlandCfs;
                }

                if (obj_name === "iptPipeRialtoCfs") {

                    json_datos.valDcppRialtoCfs = json_datos.valPipeRialtoCfs;
                }




                // }


                //oJSON.obj_valId = format_value;
                //oJSONModel.setProperty(obj_valId, format_value);
                Modelo_vista.setData(json_datos);//se envía el objeto json al modelo json creado previamente
                Modelo_vista.updateBindings(true);
                vistaOnChange.setModel(Modelo_vista);//Se modifican los datos de la vista por medio del modelo json.
                jQuery.sap.delayedCall(500, this, function () { obj.focus(); });
                //jQuery.sap.delayedCall(500, this, function () { obj.selectText(1, 1); });
                //var pos = jQuery.sap.cursorPos();

            },
            compare: function (val, lastval) {
                var beg = 0;
                var end = 1;
                var len = val.length;
                var idx = 0;
                var value = "";   //1,111
                var Lvalue = "";  //111

                for (let index = 0; index < val.length; index++) {
                    value = val.substring(beg, end);
                    Lvalue = lastval.substring(beg, end);
                    if (value === "," || Lvalue === "," || value === "." || Lvalue === ".") {
                        idx = idx + 1;
                    }
                    else {
                        if (value === Lvalue) {
                            idx = idx + 1;
                        }
                        else {
                            break;
                        }
                    }
                    beg = beg + 1;
                    end = end + 1;

                }
                return idx;
            },
            dif_cal: function (json_datos, flag, prevday, prevDaySchAllaf, dif_val, values, netValInt, netValDec, oNumberFormat, dif) {
                values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                if (values[0] == "X") {
                    prevday = values[1] + "." + values[2];
                }
                else {
                    prevday = values[1];
                }
                values = this.number_val(json_datos.val_CliftCourt_af, flag, netValInt, netValDec)
                if (values[0] == "X") {
                    prevDaySchAllaf = values[1] + "." + values[2];
                }
                else {
                    prevDaySchAllaf = values[1];
                }
                dif_val = oNumberFormat.format(this.Clifton_dif(Number(prevday), Number(prevDaySchAllaf), dif));
                json_datos.val_CliftCourt_Dif = dif_val;
            },

            Clifton_dif: function (prevday, prevsch, dif) {
                dif = prevday - prevsch;
                return dif;
            },
            number_val: function (val, flag, int, dec) {
                //Verificamos si el valor contiene . decimal
                if (val.includes(".")) {
                    //Si se encontró el . decimal entonces separamos enteros de decimales en un array
                    var IntDec = val.split('.');

                    //Nos aseguramos de que solo existan dígitos tanto en los enteros como en los decimales
                    int = IntDec[0].replace(/[^\d]/g, "");//Regex muy simple si encuentra "," en cualquier parte del valor, lo reemplaza o en este caso lo elimina.
                    dec = IntDec[1].replace(/[^\d]/g, "");
                    flag = "X";
                }
                //Si no se encuentra . decimale entonces tomamos el valor enviado por el usuario
                else {
                    //Nos aseguramos de que solo existan dígitos
                    int = val.replace(/[^\d]/g, "");//Regex muy simple si encuentra "," en cualquier parte del valor, lo reemplaza o en este caso lo elimina.
                    dec = "";
                    flag = "";
                }
                return [flag, int, dec];

            },
            delcomma: function (val) {
                var value = val;
                value = value.replace(/[^\d \+ \- \.]/g, "");

                return value
            },
            onBeforeRendering: function () {

                //jQuery.sap.delayedCall(500, this, function () {  this.byId("iptAqDlv2230").focus(); });
                // var dummy = "X";
            },
            onAfterRendering: function () {
                jQuery.sap.delayedCall(500, this, function () { this.byId("lbl_hdstate").focus(); });
            },


            OnLiveChgEvt1: function (evt) {

                //Para obtener los parámetros enviados en el eventhandler(evt), esto nos servirá para
                //Crear el objeto formateador
                var dig = evt.getSource().data("digitsallowed");     //Número de dígitos permitidos
                var id = evt.getSource().data("error");              //Texto identificador del mensaje de error
                var decAllwd = evt.getSource().data("decAllwd");     //Número de decimales permitidos
                var obj_name = evt.getSource().data("name");         //Nombre del objeto que dispara el evento
                var obj_valId = evt.getSource().data("val");         //Nombre de la variable que contiene el valor
                var sign_allwd = evt.getSource().data("sign");       //Indica que el campo acepta signos + o -
                var flag_dec = "";                                   //Flag para saber si contiene decimales
                var sign = "";                                       //Para considerar signos.
                //#region Variables para calculo de diferencia
                var prevDaySchAllaf = 0;
                var prevday = 0;
                var dif = 0;
                var dif_val = 0;
                var netValInt = 0;
                var netValDec = 0;
                var flag = "";
                var values;
                var obj = this.byId(obj_name);
                //#endregion
                //------------------------------------

                //Se crea un objeto de tipo formateador, el cual sirve para aplicar el formato requerido al objeto
                var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                    //Número de decimales permitidos, en este caso solo queremos números enteros
                    maxFractionDigits: decAllwd,
                    //Se agrupan los números, en este caso de 3 en 3
                    groupingEnabled: true,
                    //Separados de grupos
                    groupingSeparator: ",",
                    //Separador para decimales
                    decimalSeparator: ".",
                    //Número máximo de dígitos permitidos
                    maxIntegerDigits: dig
                });

                //-------------------------------------------

                //Se crea el modelo json que nos servirá para recuperar y mandar valores a los objetos de la vista
                //Se obtiene la vista, lo cual nos da acceso a todos los componentes en ella.
                var vistaOnChange = this.getView("Index");
                //var oJSONModel = new sap.ui.model.json.JSONModel();
                var Modelo_vista = vistaOnChange.getModel();
                var json_datos = Modelo_vista.getData();

                //Se obtiene la fuente (objeto) que disparó el evento y a continuación el valor de dicho objeto
                var value = evt.getSource().getValue();

                //Modelo_vista.setData(null);

                //if (typeof IntDec === "undefined") {
                //Esto sirve para saber si una variables ya esta definida
                //}

                //----------------------------
                if ((value.substring(0, 1).includes("+") || value.substring(0, 1).includes("-")) && sign_allwd === "X") {
                    switch (value.substring(0, 1)) {
                        //case "+":
                        //  sign = "+";
                        //break;
                        case "-":
                            sign = "-";
                            break;
                        default:
                            break;
                    }

                }
                //Verificamos si el valor contiene . decimal
                if (value.includes(".")) {
                    //Si se encontró el . decimal entonces separamos enteros de decimales en un array
                    var IntDec = value.split('.');

                    //Nos aseguramos de que solo existan dígitos tanto en los enteros como en los decimales
                    var netvalueint = IntDec[0].replace(/[^\d]/g, "");//Regex muy simple si encuentra "," en cualquier parte del valor, lo reemplaza o en este caso lo elimina.
                    // if(decAllwd !=""){
                    var netvaluedec = IntDec[1].replace(/[^\d]/g, "");
                    flag_dec = "X";
                    //}
                    //else{

                }
                //Si no se encuentra . decimale entonces tomamos el valor enviado por el usuario
                else {
                    //Nos aseguramos de que solo existan dígitos
                    var value = value.replace(/[^\d]/g, "");//Regex muy simple si encuentra "," en cualquier parte del valor, lo reemplaza o en este caso lo elimina.
                    flag_dec = "";
                }
                if ((flag_dec === "X" && decAllwd != "") || flag_dec === "") {

                    //---------------------------------

                    //Verificamos que los enteros no excedan el valor indicado de digitos permitidos ()
                    //Se verifica si la variante netvaluint esta definida(se encontró . decimal y se realizó el split)
                    if (typeof netvalueint !== "undefined") {
                        // Si esta definida hay punto decimal y por l tanto usamos el valor recuperado de la vista
                        if (netvalueint.length > dig) {
                            //Si se sobrepaso el número de dígitos permitidos se lanza msg de error.
                            if (decAllwd > 0) {
                                if (decAllwd === "1") {
                                    var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                        " digit number with " + decAllwd + " decimal place." + "\n\r Please enter a proper value.";
                                    json_datos[obj_valId] = "";

                                    format_value = "";
                                }
                                else {
                                    var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                        " digit number with " + decAllwd + " decimal places." + "\n\r Please enter a proper value.";
                                    json_datos[obj_valId] = "";

                                    format_value = "";
                                }

                            }
                            else {
                                var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                    " digit number." + "\n\r Please enter a proper value.";
                                json_datos[obj_valId] = "";
                                format_value = "";
                            }
                            sap.m.MessageBox.error(msgerror);
                        }
                        else {
                            //Verificamos que la variable contenga valores, en este punto deberian ser dígitos o null o podría ser "" por q se ingresó
                            //un . decimal como primer caracter
                            if (netvalueint !== null & netvalueint !== "") {

                                //Verificamos si existen valores en la parte decimal
                                if ((netvaluedec !== null && netvaluedec !== "" && netvaluedec !== undefined)) {
                                    //Si hay decimales se concatenan a los enteros y se formatea
                                    value = netvalueint + '.' + netvaluedec;
                                    //var format_value = sign + oNumberFormat.format(value);
                                    var format_value = sign + value;
                                }
                                else {
                                    //Si no hay decimales se formatean solo los enteros

                                    //var format_value = oNumberFormat.format(netvalueint);
                                    var format_value = netvalueint;
                                    //Se agrega el punto decimal 
                                    if (decAllwd != "") {
                                        format_value = sign + format_value + ".";
                                    }
                                    else {
                                        format_value = sign + format_value;
                                    }

                                }
                            }
                            else {
                                //No se encontraron valores enteros
                                //Se verifica si hay valores decimales
                                if (netvaluedec !== null & netvaluedec !== "") {
                                    value = '.' + netvaluedec;
                                    //var format_value = sign + oNumberFormat.format(value);
                                    var format_value = sign + value;
                                }
                                else {
                                    // no hay decimales, se devuelve el punto decimal.
                                    var format_value = sign + '.';
                                }
                            }
                        }
                    }
                    //Si no se realizó el split se usa el valor recuperado de la vista (value)
                    else {
                        if (value.length > dig) {
                            //Si se sobrepaso el número de dígitos permitidos se lanza msg de error.
                            if (decAllwd > 0) {
                                if (decAllwd === "1") {
                                    var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                        " digit number with " + decAllwd + " decimal place." + "\n\r Please enter a proper value.";
                                    json_datos[obj_valId] = "";

                                    format_value = "";
                                }
                                else {
                                    var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                        " digit number with " + decAllwd + " decimal places." + "\n\r Please enter a proper value.";
                                    json_datos[obj_valId] = "";

                                    format_value = "";
                                }

                            }
                            else {
                                var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                                    " digit number. " + "\n\r Please enter a proper value.";
                                json_datos[obj_valId] = "";
                                format_value = "";
                            }
                            sap.m.MessageBox.error(msgerror);
                        }
                        else {
                            if (value !== "") {
                                var format_value1 = sign + oNumberFormat.format(value);
                                var format_value = sign + format_value1.toString();
                                //obj.setValue(format_value);
                            }
                            else {
                                var format_value = sign + "";
                            }

                        }
                    }
                }
                else {
                    var msgerror = "The maximum allowed limit for " + id + " is a " + dig +
                        " digit number." + "\n\r Please enter a proper value.";
                    json_datos[obj_valId] = "";
                    format_value = ""; //oNumberFormat.format(netvalueint);
                    sap.m.MessageBox.error(msgerror);
                }

                json_datos[obj_valId] = format_value;
                //obj.setValue(format_value);

                if (obj_name === "ipt_CliftCourt2_PrevDay_DA" || obj_name === "ipt_CliftCourt_PrevDay_SAAf") {


                    values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                    this.dif_cal(json_datos, flag, prevday, prevDaySchAllaf, dif_val, values, netValInt, netValDec, oNumberFormat, dif)
                }
                //Cuando se modifique el valor del campo Prev. Day Scheduled Allotment, se calcula el valor del campo
                //Prev. Day Scheduled AllotmentAF
                if (obj_name === "ipt_CliftCourt4_PrevDay_SA") {
                    //Se crea un objeto de tipo formateador, el cual sirve para aplicar el formato requerido al objeto
                    var oNumberFormat1 = sap.ui.core.format.NumberFormat.getFloatInstance({
                        //Número de decimales permitidos, en este caso solo queremos números enteros
                        maxFractionDigits: 0,
                        //Se agrupan los números, en este caso de 3 en 3
                        groupingEnabled: true,
                        //Separados de grupos
                        groupingSeparator: ",",
                        //Separador para decimales
                        decimalSeparator: "",
                        //Número máximo de dígitos permitidos
                        maxIntegerDigits: 6,
                        //roundingMode: "TOWARDS_ZERO"
                    });
                    var valClifCrtAf = json_datos[obj_valId].replace(/,/g, "");

                    var calc = (Number(valClifCrtAf) * 1.9835).toString();
                    var PdIntDec = "";
                    if (calc.includes(".")) {
                        PdIntDec = calc.split('.');
                        json_datos.val_CliftCourt_af = oNumberFormat1.format(PdIntDec[0]);
                    }
                    else {
                        json_datos.val_CliftCourt_af = oNumberFormat1.format(calc);
                    }

                    values = this.number_val(json_datos.val_CliftCourt_PrevDayDivAllot, flag);// [flag,int,dec]
                    this.dif_cal(json_datos, flag, prevday, prevDaySchAllaf, dif_val, values, netValInt, netValDec, oNumberFormat, dif)

                }
                if (obj_name === "ipt_DvppArrMtr" || obj_name === "ipt_DvppRelInAq") {
                    var oNumberFormatDvpp = sap.ui.core.format.NumberFormat.getFloatInstance({
                        //Número máximo de dígitos permitidos
                        maxIntegerDigits: 9,
                        //Número de decimales permitidos, en este caso solo queremos números enteros
                        maxFractionDigits: 0,
                        //Se agrupan los números, en este caso de 3 en 3
                        groupingEnabled: true,
                        //Separados de grupos
                        groupingSeparator: ",",
                        //Separador para decimales
                        decimalSeparator: "",

                    });
                    var ArrMtr = Number(json_datos.val_dvpp_arrMtr);
                    var Devria = Number(json_datos.val_dvpp_relIntoAqu);

                    if (ArrMtr > 0) {
                        var total = ArrMtr + Devria;
                        json_datos.val_sbpp_aquedBlend = oNumberFormatDvpp.format((ArrMtr * 100) / (ArrMtr + Devria).toString());
                    }
                    var aqBlend = 100 - Number(json_datos.val_sbpp_aquedBlend);
                    json_datos.val_sbpp_dvRes = oNumberFormatDvpp.format(aqBlend.toString());

                }




                // }


                //oJSON.obj_valId = format_value;
                //oJSONModel.setProperty(obj_valId, format_value);
                Modelo_vista.setData(json_datos);//se envía el objeto json al modelo json creado previamente
                Modelo_vista.updateBindings(true);
                vistaOnChange.setModel(Modelo_vista);//Se modifican los datos de la vista por medio del modelo json.
                jQuery.sap.delayedCall(500, this, function () { this.byId("iptFlowsProj").focus(); });
                jQuery.sap.delayedCall(500, this, function () { this.byId(obj_name).focus(); });
                //var pos = jQuery.sap.cursorPos();

            },
            onSubmit: async function (UsrModel, data) {
                var oView = this.getView("Index");
                var oThat = this;
                MessageBox.confirm("Are you ready to submit?", {
                    view: oView,
                    that: oThat,
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: async function (sAction) {
                        if (sAction === "OK") {
                            var PostMidNgthConUrl = "/sap/opu/odata/sap/ZODATA_MC_WRST_SRV/";
                            var Service = new sap.ui.model.odata.ODataModel(PostMidNgthConUrl, true);
                            //var submitJson = this.view.getModel().getData();
                            var oView = this.that.getView("Index");
                            var submitJson = oView.getModel().getData();
                            //var oView = this.view;
                            var submitJsonRmrk = submitJson;
                            var now = new Date();
                            var uuci;
                            var oEntry = {};

                            
                            //#region Mapping
                            oEntry.Abn1e = this.that.delcomma(submitJson.valDcppAfter1.toString());
                            oEntry.Abn2e = this.that.delcomma(submitJson.valDcppAfter2.toString());
                            oEntry.Alppp = submitJson.valMcdate + "WRST" + "ALPPP";
                            oEntry.Cacin = oView.byId("cbx_JurCtrlAqCtrl").getValue();
                            oEntry.Chpppscne = submitJson.valMcdate + "WRST" + "CHPPPSCNE";
                            oEntry.Cypppscne = submitJson.valMcdate + "WRST" + "CYPPPSCNE";
                            oEntry.Dcpppscne = submitJson.valMcdate + "WRST" + "DCPPPSCNE";
                            oEntry.Dwrsec = oView.byId("cbx_SecThreatLvls_dwr").getValue();
                            oEntry.Etp4348 = this.that.delcomma(submitJson.valFlows4358.toString());
                            oEntry.Etp5966 = this.that.delcomma(submitJson.valFlows5966.toString());
                            oEntry.Gspppscne = submitJson.valMcdate + "WRST" + "GSPPPSCNE";
                            oEntry.Icli = oView.byId("cbxIntakeCastaic").getValue();
                            oEntry.Icvo = submitJson.valMcdate + "WRST" + "ICVO";
                            oEntry.Infd = oView.byId("cbxPipeInland").getValue();
                            oEntry.Infdcfs = this.that.delcomma(submitJson.valPipeInlandCfs.toString());
                            oEntry.Infdff = submitJson.valDcppInland.toString();
                            oEntry.Infdffcfs = submitJson.valDcppInlandCfs.toString();
                            oEntry.Ipvo = submitJson.valMcdate + "WRST" + "IPVO";
                            oEntry.Islo = submitJson.valMcdate + "WRST" + "ISLO";
                            oEntry.Mandt = submitJson.valMandt;
                            oEntry.Mcdate = submitJson.valMcdate;
                            oEntry.Mctime = now.getHours().toString() + now.getMinutes().toString() + now.getSeconds().toString();
                            oEntry.Mjppf = this.that.delcomma(submitJson.valMjppFbay.toString());
                            oEntry.Mjppps = submitJson.valMcdate + "WRST" + "MJPPPS";
                            oEntry.Mjpps = this.that.delcomma(submitJson.valMjppSilver.toString());
                            oEntry.Natsec = oView.byId("cbx_SecThreatLvls_nat").getValue();
                            oEntry.Osppfe = this.that.delcomma(submitJson.valOsppFbay.toString());
                            oEntry.Ospppscne = submitJson.valMcdate + "WRST" + "OSPPPSCNE";
                            oEntry.Pbppf = this.that.delcomma(submitJson.valPbppFbay.toString());
                            oEntry.Pbppp = submitJson.valMcdate + "WRST" + "PBPPP";
                            oEntry.Psl = this.that.delcomma(submitJson.valPipeLasFlores.toString());
                            oEntry.Psr = oView.byId("cbxPipeRialto").getValue();
                            oEntry.Psrcfs = this.that.delcomma(submitJson.valPipeRialtoCfs.toString());
                            oEntry.Pss = oView.byId("cbxPipeSapl").getValue();
                            oEntry.Psscfs = this.that.delcomma(submitJson.valPipeSaplCfs.toString());
                            oEntry.Pwi = this.that.delcomma(submitJson.valFlowsProj.toString());
                            oEntry.Saplff = submitJson.valDcppSAPL.toString();
                            oEntry.Saplffcfs = this.that.delcomma(submitJson.valDcppSAPLCfs.toString());
                            oEntry.Sjrff = submitJson.valDcppRialto.toString();
                            oEntry.Sjrffcfs = this.that.delcomma(submitJson.valDcppRialtoCfs.toString());
                            oEntry.Srfcd = this.that.delcomma(submitJson.valFlowsCastaic.toString());
                            oEntry.Srfcsd = this.that.delcomma(submitJson.valFlowsCedar.toString());
                            oEntry.Srfp = this.that.delcomma(submitJson.valFlowsPyramid.toString());
                            oEntry.Srfpls = this.that.delcomma(submitJson.valFlowsPerris.toString());
                            oEntry.Teabf = this.that.delcomma(submitJson.valFlowsTehach.toString());

                            uuci = "";
                            uuci = oView.byId("chk_DcppIso1").getSelected();
                            if (uuci === true) {
                                oEntry.Uiic1 = "1";
                            }
                            else {
                                oEntry.Uiic1 = "0";
                            }
                            uuci = "";
                            uuci = oView.byId("chk_DcppIso2").getSelected();

                            if (uuci === true) {
                                oEntry.Uiic2 = "1";
                            }
                            else {
                                oEntry.Uiic2 = "0";
                            }

                            uuci = "";
                            uuci = oView.byId("chk_DcppIso3").getSelected();

                            if (uuci === true) {
                                oEntry.Uiic3 = "1";
                            }
                            else {
                                oEntry.Uiic3 = "0";
                            }

                            uuci = "";
                            uuci = oView.byId("chk_DcppIso4").getSelected();

                            if (uuci === true) {
                                oEntry.Uiic4 = "1";
                            }
                            else {
                                oEntry.Uiic4 = "0";
                            }

                            oEntry.Uname = submitJson.valUsrName;
                            oEntry.Wwppfe = this.that.delcomma(submitJson.valWwppFbay.toString());
                            oEntry.Wwpppscne = submitJson.valMcdate + "WRST" + "WWPPPSCNE";
                            //#endregion Mapping


                            var MidNgthCon = "";
                            var MidNgthConSrv = await this.that.postMidNgthConSrv(Service, oEntry);
                            if (MidNgthConSrv[0].result === "ERROR") {
                                MessageBox.error((MidNgthConSrv[0].data));
                            }
                            else {
                                var sserviceurlRmrks = "/sap/opu/odata/sap/ZODATA_MC_WRDTREM_ST_SRV/";
                                var oModelRmrks = new sap.ui.model.odata.ODataModel(sserviceurlRmrks, true);
                                //var submitJsonRmrk = oView.getModel().getData();
                                var oEntryRmrks = {};


                                var oEntryRmrks = {};
                                oEntryRmrks.Alppp = oView.byId("rmrkAlpp").getValue();
                                oEntryRmrks.Chpppscne = oView.byId("rmrkChpp").getValue();
                                oEntryRmrks.Cypppscne = oView.byId("rmrkCvpp").getValue();
                                oEntryRmrks.Dcpppscne = oView.byId("rmrkDcpp").getValue();
                                oEntryRmrks.Gspppscne = oView.byId("rmrkGspp").getValue();
                                oEntryRmrks.Icvo = oView.byId("rmrkIntakeCastaic").getValue();
                                oEntryRmrks.Ipvo = oView.byId("rmrkIntakePerris").getValue();
                                oEntryRmrks.Islo = oView.byId("rmrkIntakeSanBer").getValue();
                                oEntryRmrks.Mjppps = oView.byId("rmrkMjpp").getValue();
                                oEntryRmrks.Osppfe = ""//Al parecer nunca se guarda este valor
                                oEntryRmrks.Ospppscne = oView.byId("rmrkOspp").getValue();
                                oEntryRmrks.Pbppp = oView.byId("rmrkPbpp").getValue();
                                oEntryRmrks.Wwppfe = ""//Al parecer nunca se guarda este valor
                                oEntryRmrks.Wwpppscne = oView.byId("rmrkWwpp").getValue();
                                oEntryRmrks.Zcwmremkey = submitJsonRmrk.valMcdate + "WRSJ";

                                var remarksSrv = await this.that.postRmrksSrv(oModelRmrks, oEntryRmrks);
                                if (remarksSrv[0].result === "ERROR") {
                                    MessageBox.error((remarksSrv[0].data));
                                }
                                else {
                                    var dataModel = this.that.getOwnerComponent().getModel("data");//Will contain data mapped from the ODATA services
                                    MessageBox.confirm("Data submitted successfully", {
                                        that1: this.that,
                                        view: oView,
                                        dataModelsbm:dataModel,
                                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                                        emphasizedAction: MessageBox.Action.OK,
                                        onClose: async function (sAction) {
                                            if (sAction === "OK") {
                                                var btnSb = this.that1.getView().byId("btn_Submit");
                                                //btnSb = view.byId("btn_Submit");
                                                btnSb.setEnabled(false);
                                                dataModel.setProperty("/valSubmitted", "This form has been submitted")
                                                //this.that1.onInit();

                                            }
                                        }
                                    })





                                    //MessageBox.success("Data submitted successfully")
                                    //this.that.onInit();
                                }

                            }

                            //var vt1 = this.getView("View1").byId("chk_DvppTier1").getSelected();
                            //if (vt1 === true) {
                            //    oEntry.Tvop1 = "1";
                            //}
                            //else { oEntry.Tvop1 = ""; }
                        }
                    }
                });


            },

        });
    });
