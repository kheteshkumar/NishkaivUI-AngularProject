import { Injectable } from '@angular/core';
// import { UserType } from '../enum/storage.enum';
// import { AccessRights } from '../enum/access-rights.enum';
// import { StorageService } from '../common/session/storage.service';
// import { StorageType } from '../common/session/storage.enum';
// import { AppSetting } from '../constant/appsetting.constant';
// import { CommonAPIFuncService } from './common-api-func.service';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { StorageService } from '../session/storage.service';
import { CommonApiFuncService } from './common-api-func.service';
import { StorageType } from '../session/storage.enum';
import { AppSetting } from 'src/app/common/constants/appsetting.constant';
import { UserTypeEnum } from 'src/app/enum/user-type.enum';
import { CommonService } from './common.service';
import { FeaturesEnum } from 'src/app/enum/features.enum';

@Injectable({
  providedIn: 'root'
})
export class AccessRightsService {
  loggedInUserData: any = {};
  loggedInUserRoleDetails: any = {};
  loggedInUserModuleDetails = {};
  allowedTransactionTypes: any = {};
  loggedInUserModuleDetailsNew = new BehaviorSubject<any>(this.getLoggedInUserModuleDetails());
  patientUser = {
    '101': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '102': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 1, 'modifyAccess': 1, 'viewAccess': 1 },
    '103': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '131': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '132': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '201': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 1, 'modifyAccess': 1, 'viewAccess': 1 }, // Manage_Provider
    '202': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 1, 'modifyAccess': 1, 'viewAccess': 1 }, // Manage_Patient
    '301': { 'addAccess': 0, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '302': { 'addAccess': 0, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '351': { 'addAccess': 0, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '352': { 'addAccess': 0, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '354': { 'addAccess': 0, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '355': { 'addAccess': 0, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '401': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 }, // Prefrence_Rate_Plan
    '402': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 1, 'modifyAccess': 1, 'viewAccess': 1 }, // Prefrence_Fees
    '501': { 'addAccess': 0, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 }, // Manage_Provider_AllowedTransactionType
    '502': { 'addAccess': 0, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 }, // Manage_Provider_Processor_Config
    '503': { 'addAccess': 0, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 }, // Prefrence_ProviderBilling_Config
    '510': { 'addAccess': 0, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '511': { 'addAccess': 0, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 }
  };
  globalAdmin = {
    '2101': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '2102': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 1, 'modifyAccess': 1, 'viewAccess': 1 },
    '2103': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '2131': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '2132': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 1, 'modifyAccess': 1, 'viewAccess': 1 },
    '2161': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '2162': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '2201': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 1, 'modifyAccess': 1, 'viewAccess': 1 },  // Manage_Provider
    '2202': { 'addAccess': 1, 'deleteAccess': 0, 'executeAccess': 1, 'modifyAccess': 1, 'viewAccess': 1 },  // Manage_Patient
    '2203': { 'addAccess': 0, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 0, 'viewAccess': 1 },  // ReportAccess_ProviderActivation
    '2301': { 'addAccess': 0, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '2302': { 'addAccess': 0, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '2303': { 'addAccess': 0, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '2351': { 'addAccess': 0, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '2352': { 'addAccess': 0, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '2353': { 'addAccess': 0, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '2401': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '2402': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },  // Defaults_Rate_Plan
    '2501': { 'addAccess': 0, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },  // Manage_Provider_Processor_Config
    '2502': { 'addAccess': 0, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '2503': { 'addAccess': 0, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },  // Manage_Provider_AllowedTransactionType
    '2504': { 'addAccess': 0, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },  // Prefrence_ProviderBilling_Config
    '2505': { 'addAccess': 0, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 0, 'viewAccess': 1 },  // ReportAccess_ProviderBilling
    '2510': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 1, 'modifyAccess': 1, 'viewAccess': 1 },
    '2511': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 1, 'modifyAccess': 1, 'viewAccess': 1 },
    '2512': { 'addAccess': 0, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 0, 'viewAccess': 1 },  // ReportAccess_Transaction
  };

  providerAdmin = {
    '1101': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '1102': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 1, 'modifyAccess': 1, 'viewAccess': 1 },
    '1103': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '1201': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },  // Patient_Management
    '1202': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },  // Patient_Account
    '1203': { 'addAccess': 1, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 0, 'viewAccess': 1 },
    '1204': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 1, 'modifyAccess': 1, 'viewAccess': 1 },
    '1210': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 1, 'modifyAccess': 1, 'viewAccess': 1 },
    '1301': { 'addAccess': 0, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '1351': { 'addAccess': 0, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '1352': { 'addAccess': 0, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '1401': { 'addAccess': 1, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '1402': { 'addAccess': 0, 'deleteAccess': 1, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },
    '1403': { 'addAccess': 1, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 1, 'viewAccess': 1 },  // Transactions
    '1501': { 'addAccess': 0, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 0, 'viewAccess': 1 },  // Allowed Transaction Type
    '1502': { 'addAccess': 0, 'deleteAccess': 0, 'executeAccess': 0, 'modifyAccess': 0, 'viewAccess': 1 }   // Processor Configuration
  };

  constructor(
    private storageService: StorageService,
    private commonAPIFuncService: CommonApiFuncService,
    private commonService: CommonService
  ) { }

  getLoggedInData() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  getloggedInUserRoleDetails() {
    return JSON.parse(this.storageService.get(StorageType.session, 'userDetails'));
  }

  getLoggedInUserModuleDetails() {
    return JSON.parse(this.storageService.get(StorageType.session, 'moduleDetails'));
  }

  setLoggedInUserModuleDetails(data): any {
    this.loggedInUserModuleDetailsNew.next(data);
  }

  getAllowedTransactionTypesDetails() {
    return JSON.parse(this.storageService.get(StorageType.session, 'allowedTransactionTypes'));
  }

  // Method to check Module Permission
  hasModuleAccessRedirect(moduleId) {
    // temp code to be removed after API Completion for module access for other entities
    if (this.loggedInUserData.userType !== UserTypeEnum.PROVIDER) {
      return;
    }
    // temp code to be removed after API Completion for module access for other entities
    this.loggedInUserModuleDetails = this.getLoggedInUserModuleDetails();
    if (this.loggedInUserModuleDetails.hasOwnProperty(moduleId) && Boolean(JSON.parse(this.loggedInUserModuleDetails[moduleId]['hasAccess'])) === true) {
      return;
    } else {
      this.storageService.save(StorageType.local, 'unathorizedToAccessResource', JSON.stringify(true));
      this.commonService.logOut();
    }
  }

  // Method to check Module Permission
  hasModuleAccess(moduleId) {
    this.loggedInUserData = this.getLoggedInData();
    this.loggedInUserModuleDetails = this.getLoggedInUserModuleDetails();
    // console.log('hasModuleAccess called')
    if (this.loggedInUserModuleDetails && this.loggedInUserModuleDetails.hasOwnProperty(moduleId) && Boolean(JSON.parse(this.loggedInUserModuleDetails[moduleId]['hasAccess'])) === true) {
      return true;
    } else {
      return false;
    }
  }

  // Method to check Operation Permission
  // hasAccess(globalOperationId, patientId, providerOperationId, requiredAccess) {
  //   this.loggedInUserData = this.getLoggedInData();
  //   if (this.loggedInUserData.roleId !== null) {
  //     this.loggedInUserRoleDetails = this.getloggedInUserRoleDetails();
  //   }

  //   if (this.loggedInUserData.userType === 0) {  // Patient
  //     if (this.patientUser.hasOwnProperty(patientId) && this.patientUser[patientId][requiredAccess] === 1) {
  //       if (this.loggedInUserData.roleId !== null) {
  //         if (this.loggedInUserRoleDetails.hasOwnProperty(patientId) &&
  //           this.loggedInUserRoleDetails[patientId][requiredAccess] === true) {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //       } else {
  //         return true;
  //       }
  //     } else {
  //       return false;
  //     }
  //   }

  //   if (this.loggedInUserData.userType === 1) {  // Provider
  //     if (this.providerAdmin.hasOwnProperty(providerOperationId) && this.providerAdmin[providerOperationId][requiredAccess] === 1) {
  //       if (this.loggedInUserData.roleId !== null) {
  //         // if (this.loggedInUserRoleDetails.hasOwnProperty(providerOperationId) &&
  //         // this.loggedInUserRoleDetails[providerOperationId][requiredAccess] === true) {
  //         return true;
  //         // } else {
  //         //   return false;
  //         // }
  //       } else {
  //         return true;
  //       }
  //     } else {
  //       return false;
  //     }
  //   }

  //   if (this.loggedInUserData.userType === 2) {  // Global
  //     if (this.globalAdmin.hasOwnProperty(globalOperationId) && this.globalAdmin[globalOperationId][requiredAccess] === 1) {
  //       if (this.loggedInUserData.roleId !== null) {
  //         if (this.loggedInUserRoleDetails.hasOwnProperty(globalOperationId) &&
  //           this.loggedInUserRoleDetails[globalOperationId][requiredAccess] === true) {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //       } else {
  //         return true;
  //       }
  //     } else {
  //       return false;
  //     }
  //   }
  // }

  // Method to check Operation Permission
  hasAccess(requiredAccess) {
    this.loggedInUserData = this.getLoggedInData();
    if (this.loggedInUserData.roleId !== null && this.loggedInUserData.roleId !== '') {
      this.loggedInUserRoleDetails = this.getloggedInUserRoleDetails();
    } else {
      return true;
    }

    if (this.loggedInUserRoleDetails.accessDetails.length > 0) {
      let featuresList: any = [];
      this.loggedInUserRoleDetails.accessDetails.forEach(moduleDetail => {
        if (Boolean(JSON.parse(moduleDetail.hasAccess)) === true) {
          featuresList.push(...moduleDetail.featureList);
        }
      });

      if (featuresList.length > 0) {
        let feature = featuresList.find(x => x.featureId == requiredAccess);
        if (feature !== undefined) {
          // console.log('feature access given');
          return true;
        } else {
          // console.log('this feature not accessible');
          return false;
        }
      } else {
        // console.log('no feature access for this user');
        return false;
      }

    } else {
      // console.log('no module access for this user')
      return false;
    }

  }

  getAllFeatureAccessToUser() {
    return JSON.parse(this.storageService.get(StorageType.session, 'permissions'));
  }

  setAllFeatureAccessToUser() {
    let array = this.convertEnumToArray(FeaturesEnum);

    let permission = {};

    array.forEach(element => {
      element.hasAccess = this.hasAccess(element.id);
      permission[element.name] = element.hasAccess;
    });

    this.storageService.save(StorageType.session, 'permissions', JSON.stringify(permission));
  }

  private convertEnumToArray(enums) {
    const arrayObjects = []
    for (const [propertyKey, propertyValue] of Object.entries(enums)) {
      if (!Number.isNaN(Number(propertyKey))) {
        continue;
      }
      arrayObjects.push({ id: propertyValue, name: propertyKey });
    }
    return arrayObjects;
  }

  // /roles
  getRoleDetails() {
    this.loggedInUserData = this.getLoggedInData();
    let url = '';
    if (this.loggedInUserData.userType === 1) {  // Provider
      url = `${AppSetting.baseUrl}providers/${this.loggedInUserData.parentId}/roles/${this.loggedInUserData.roleId}`;
    } else if (this.loggedInUserData.userType === 2) {  // Global
      url = `${AppSetting.baseUrl}roles/${this.loggedInUserData.roleId}`;
    }
    return this.commonAPIFuncService.get(url).pipe(
      tap(a => {
        const loggedInUserRoleDetails = {};
        let tempOperationId;
        a['roleDetails'].forEach(function (item) {
          tempOperationId = item.operationId;
          // delete item.id;
          loggedInUserRoleDetails[tempOperationId] = item;
        });
        this.storageService.save(StorageType.session, 'roleDetails', JSON.stringify(loggedInUserRoleDetails));
        this.log(`fetched`);
      }),
      catchError(this.handleError('', []))
    );
  }

  // getModuleDetails(parentId) {

  //   let url = '';
  //   url = AppSetting.featuresaccess.getModuleConfig.replace('{parentId}', parentId);

  //   return this.commonAPIFuncService.get(url)
  //     .pipe(
  //       tap((response: any) => {
  //         const loggedInUserModuleDetails = {};
  //         let tempModuleId;
  //         response.data.forEach(function (item) {
  //           tempModuleId = item.moduleId;
  //           loggedInUserModuleDetails[tempModuleId] = item;
  //         });
  //         this.storageService.save(StorageType.session, 'moduleDetails', JSON.stringify(loggedInUserModuleDetails));
  //         this.setLoggedInUserModuleDetails(loggedInUserModuleDetails);
  //       }),
  //       map((resp: any) => {
  //         resp = this.getLoggedInUserModuleDetails();
  //         return resp;
  //       }),
  //       catchError(this.handleError('', []))
  //     );
  // }

  getModuleDetails(userDataResponse) {

    const response = userDataResponse.accessDetails;
    const loggedInUserModuleDetails = {};
    let tempModuleId;
    response.forEach(function (item) {
      tempModuleId = item.moduleId;
      loggedInUserModuleDetails[tempModuleId] = item;
    });
    this.storageService.save(StorageType.session, 'moduleDetails', JSON.stringify(loggedInUserModuleDetails));
    this.setLoggedInUserModuleDetails(loggedInUserModuleDetails);
    this.setAllFeatureAccessToUser();

  }

  getModuleConfig(parentId) {

    let url = '';
    url = AppSetting.featuresaccess.getModuleConfig.replace('{parentId}', parentId);
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  getfeatureConfig(reqObj, parentId) {

    let url = '';
    url = AppSetting.featuresaccess.getfeatureConfig.replace('{parentId}', parentId);
    url = `${url}${this.commonService.buildQuery(reqObj)}`;

    return this.commonAPIFuncService.get(url)
      .pipe(
        map((res: any) => {
          res.data.forEach(element => {
            element.isSmsEnabled = Boolean(JSON.parse(element.isSmsEnabled));
            element.isEmailEnabled = Boolean(JSON.parse(element.isEmailEnabled));
          });
          const data = res;
          return data;
        }),
        tap(a => this.commonAPIFuncService.log(`fetched`)),
        catchError(this.commonAPIFuncService.handleError('', []))
      );
  }

  // Get Allowed Transaction Types for logged in user
  getAllowedTransactionType() {
    this.loggedInUserData = this.getLoggedInData();
    let url = '';
    if (this.loggedInUserData.userType === 1) {
      // url = `${AppSetting.baseUrl}providers/${this.loggedInUserData.parentId}/allowedtransactiontypes`;
    } else {
      // console.log("need to work in it");
      // url = `${AppSetting.baseUrl}resellers/${this.loggedInUserData.resellerId}/providers/${this.loggedInUserData.parentId}/allowedtransactiontypes`;
    }
    return this.commonAPIFuncService.get(url)
      .pipe(
        tap((a: any) => {
          const allowedTransactionTypes = a.map(item => item.channelType).filter((value, index, self) => self.indexOf(value) === index);
          this.storageService.save(StorageType.session, 'allowedTransactionTypes', JSON.stringify(allowedTransactionTypes));
          this.log(`fetched`);
        }),
        catchError(this.handleError('', []))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      // console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result.
      // return Observable.throw(error.json().error || error.message);
      return throwError(error);
      // return of(result as T);
    };
  }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    // this.messageService.add('HeroService: ' + message);
  }
}
