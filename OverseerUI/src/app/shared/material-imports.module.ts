import { NgModule } from "@angular/core";

import {
    MatButtonModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatCardModule,
    MatTabsModule,
    MatInputModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatSliderModule

 } from "@angular/material";

@NgModule({
    imports: [
        MatButtonModule,
        MatSlideToggleModule,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatCardModule,
        MatTabsModule,
        MatInputModule,
        MatIconModule,
        MatToolbarModule,
        MatMenuModule,
        MatDialogModule,
        MatSnackBarModule,
        MatProgressBarModule,
        MatSliderModule
    ],
    exports: [
        MatButtonModule,
        MatSlideToggleModule,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatCardModule,
        MatTabsModule,
        MatInputModule,
        MatIconModule,
        MatToolbarModule,
        MatMenuModule,
        MatDialogModule,
        MatSnackBarModule,
        MatProgressBarModule,
        MatSliderModule
    ]
})
export class AppMaterialModule {}
