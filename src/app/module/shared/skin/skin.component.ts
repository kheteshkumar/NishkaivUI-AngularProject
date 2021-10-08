import { Component, OnInit } from '@angular/core';
import { ToasterService } from '../../../services/api/toaster.service';
import { SettingsService } from '../../../services/api/settings.service';
import { Exception } from '../../../common/exceptions/exception';
import { ThemeService } from '../../../services/api/theme.service';
import { MessageSetting } from 'src/app/common/constants/message-setting.constant';

@Component({
  selector: 'app-skin',
  templateUrl: './skin.component.html',
  styleUrls: ['./skin.component.scss']
})
export class SkinComponent implements OnInit {
  isLoader = false;
  toastData: any;
  selectedSkin = 7;

  constructor(private toasterService: ToasterService,
    private settingsService: SettingsService,
    private themeService: ThemeService,
  ) { }

  ngOnInit() {
    this.settingsService.getSettingsData().subscribe((value) => {
      if(value!=undefined)
      {
        this.selectedSkin = value.skin;
        this.themeService.changeTheme(this.selectedSkin);
      }
      
    });
  }

  onSkinChange(selectedSkin) {
    this.selectedSkin = selectedSkin;
    this.themeService.changeTheme(this.selectedSkin);
    this.apply();
  }

  apply() {
    this.isLoader = true;
    const reqObj = {
      skin: this.selectedSkin
    };
    this.settingsService.putProviderSettingsSkin(reqObj).subscribe(
      (response: any) => {
        this.settingsService.getSettings().subscribe(
          response1 => {
            //response.logo = 'http://hptui.s3-website.us-east-2.amazonaws.com/assets/images/logo_login.png';
            this.settingsService.setSettingsData(response1);
            this.isLoader = false;
          },
          error => {
            const toastMessage = Exception.exceptionMessage(error);
            this.toastData = this.toasterService.error(toastMessage.join(', '));
            this.isLoader = false;
          }
        );
        this.isLoader = false;
      },
      error => {
        const toastMessage = Exception.exceptionMessage(error);
        this.toastData = this.toasterService.error(toastMessage.join(', '));
        this.isLoader = false;
      });
  }

  reset() {
    this.selectedSkin = 7; //DEFAULT SKIN
    this.themeService.changeTheme(this.selectedSkin);
    this.apply();
  }

}
