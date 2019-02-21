import { NgModule } from "@angular/core";
import { DragDropModule } from "@angular/cdk/drag-drop";

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
    MatSliderModule,
    MatStepperModule,
    MatExpansionModule,
    MatGridListModule
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
        MatSliderModule,
        MatStepperModule,
        MatExpansionModule,
        MatGridListModule,
        DragDropModule
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
        MatSliderModule,
        MatStepperModule,
        MatExpansionModule,
        MatGridListModule,
        DragDropModule
    ]
})
export class AppMaterialModule {}
