/* Define to prevent recursive inclusion -------------------------------------*/
#ifndef __MAIN_H
#define __MAIN_H

/* Includes ------------------------------------------------------------------*/
#include "stm32f4xx_hal.h"
#include "stm324xg_eval.h"

/* Exported types ------------------------------------------------------------*/
/* Exported constants --------------------------------------------------------*/
#define TIMx                           TIM3
#define TIMx_CLK_ENABLE()              __TIM3_CLK_ENABLE()
#define TIMx_CHANNEL_GPIO_PORT()       __GPIOC_CLK_ENABLE()
#define GPIO_PIN_CHANNEL1              GPIO_PIN_6
#define GPIO_PIN_CHANNEL2              GPIO_PIN_7
#define GPIO_PIN_CHANNEL3              GPIO_PIN_8
#define GPIO_PIN_CHANNEL4              GPIO_PIN_9

/* Exported macro ------------------------------------------------------------*/
/* Exported functions ------------------------------------------------------- */

#endif /* __MAIN_H */
