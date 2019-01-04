import { animate, style, transition, trigger, group, query } from "@angular/animations";

export const tabRouteAnimation = trigger("routeTabAnimation", [
    // transition(":increment", group([
    //     query(":enter", [
    //         style({
    //             marginLeft: "100px"
    //         }),
    //         animate("12.0s ease-in")
    //     ]),
    //     query(":leave", [
    //         style({
    //             marginRight: "100px"
    //         }),
    //         animate("12.0s ease-out")
    //     ])
    // ])),
    // transition(":decrement", [
    //     query(":enter", [
    //         style({
    //             backgroundColor: "purple"
    //         }),
    //         animate("12.0s ease-in")
    //     ]),
    //     query(":leave", [
    //         style({
    //             backgroundColor: "yellow"
    //         }),
    //         animate("12.0s ease-out")
    //     ])
    // ])
]);
