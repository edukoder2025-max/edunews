'use client';

/**
 * Google Subscribe with Google (SWG) SDK client
 * Handles opening contribution/subscription dialogs and webhook integration
 */

interface SWGSubscribeRequest {
  productId?: string;
  onSuccess?: () => void;
  onFailure?: (error: Error) => void;
}

interface SWGEntitlementResult {
  isUserEntitled: boolean;
  data?: any;
}

interface SWGBasic {
  attachButtonEl: (element: HTMLElement, options: any) => void;
  attachPendingDialog: () => void;
  detachButtonEl: (element: HTMLElement) => void;
  getEntitlements: (onSuccess: (result: SWGEntitlementResult) => void, onFailure?: (error: Error) => void) => void;
  init: (publicationId: string | any) => void;
  linkAccount: (onSuccess?: () => void, onFailure?: (error: Error) => void) => void;
  updateEligibility: (options: any) => void;
  reset: () => void;
  openContribution?: (request: { productId?: string }) => void;
  openDialog?: (request?: any) => void;
  showOffers?: (options?: any) => void;
  showSubscribeOption?: (options?: any) => void;
  showAbbrvOffer?: (options?: any) => void;
  showLoginPrompt: () => void;
  showLoginNotification: () => void;
  setOnEntitlementsResponse: (handler: (response: any) => void) => void;
  setOnLinkComplete: (handler: () => void) => void;
  setOnLoginRequest: (handler: () => void) => void;
  setOnPaymentResponse?: (handler: (response: any) => void) => void;
  setOnSubscribeResponse: (handler: (response: any) => void) => void;
}

declare global {
  interface Window {
    SWG_BASIC?: SWGBasic;
    swgUserToken?: string;
  }
}

/**
 * Initialize Google Subscribe with Google SDK
 */
export function initializeSWG(publicationId: string): void {
  if (!publicationId) {
    console.error('❌ Publication ID is required for SWG initialization');
    return;
  }

  const checkSWGAndInit = () => {
    if (window.SWG_BASIC && typeof window.SWG_BASIC.init === 'function') {
      try {
        const swg = window.SWG_BASIC;
        // Check if we are running the classic SDK vs basic SDK
        if (typeof swg.openContribution === 'function') {
          // Classic SDK uses init(publicationId: string)
          swg.init(publicationId);
          console.log('✅ SWG Classic SDK initialized successfully');
        } else if (typeof swg.showOffers === 'function') {
          // Basic SDK: it is initialized via the page scripts with the options object,
          // so we skip string-based init which might corrupt or reset the configuration.
          console.log('ℹ️ SWG Basic SDK detected. Skipping string-based initialization.');
        } else {
          // Fallback init
          swg.init(publicationId);
          console.log('✅ SWG SDK initialized successfully (fallback)');
        }
        
        // Set up event handlers
        if (typeof swg.setOnEntitlementsResponse === 'function') {
          swg.setOnEntitlementsResponse((response: any) => {
            console.log('📦 Entitlements response:', response);
            handleEntitlementsResponse(response);
          });
        }

        if (typeof swg.setOnSubscribeResponse === 'function') {
          swg.setOnSubscribeResponse((response: any) => {
            console.log('✅ Subscribe response:', response);
            handleSubscribeResponse(response);
          });
        } else if (typeof swg.setOnPaymentResponse === 'function') {
          // Fallback or basic SDK alternative
          swg.setOnPaymentResponse((response: any) => {
            console.log('✅ Payment response:', response);
            handleSubscribeResponse(response);
          });
        }

        if (typeof swg.setOnLinkComplete === 'function') {
          swg.setOnLinkComplete(() => {
            console.log('🔗 Link complete');
            handleLinkComplete();
          });
        }
      } catch (err) {
        console.error('❌ Error initializing SWG:', err);
      }
    } else {
      setTimeout(checkSWGAndInit, 100);
    }
  };

  checkSWGAndInit();
}

/**
 * Open subscription dialog for a specific product
 */
export async function openSWGDialog(productId?: string): Promise<boolean> {
  return new Promise((resolve) => {
    const deadline = setTimeout(() => {
      window.removeEventListener('swg-ready', onReady);
      console.warn('⚠️ SWG SDK did not load within 5 seconds');
      resolve(false);
    }, 5000);

    const tryOpen = () => {
      // Verify it's the SDK object, and has either showOffers (basic) or openContribution (classic)
      if (window.SWG_BASIC) {
        const swg = window.SWG_BASIC;
        const hasShowOffers = typeof swg.showOffers === 'function';
        const hasOpenContribution = typeof swg.openContribution === 'function';

        if (hasShowOffers || hasOpenContribution) {
          clearTimeout(deadline);
          window.removeEventListener('swg-ready', onReady);
          try {
            if (hasShowOffers) {
              if (productId) {
                console.log('🚀 [swgClient] Calling showOffers with productId:', productId);
                swg.showOffers!({ skus: [productId], isClosable: true });
              } else {
                console.log('🚀 [swgClient] Calling showOffers (generic)');
                swg.showOffers!({ isClosable: true });
              }
            } else if (hasOpenContribution) {
              if (productId) {
                console.log('🚀 [swgClient] Calling openContribution with productId:', productId);
                swg.openContribution!({ productId });
              } else {
                console.log('🚀 [swgClient] Calling openDialog');
                swg.openDialog!();
              }
            }
            resolve(true);
          } catch (err) {
            console.error('❌ Error opening SWG dialog:', err);
            resolve(false);
          }
        }
      }
    };

    const onReady = () => tryOpen();

    // Listen for the custom event fired by the init script
    window.addEventListener('swg-ready', onReady);

    // Also try immediately (in case SDK already loaded)
    tryOpen();
  });
}

/**
 * Get user entitlements
 */
export async function getUserEntitlements(): Promise<SWGEntitlementResult | null> {
  return new Promise((resolve) => {
    if (!window.SWG_BASIC) {
      console.error('❌ SWG SDK not initialized');
      resolve(null);
      return;
    }

    window.SWG_BASIC.getEntitlements(
      (result: SWGEntitlementResult) => {
        resolve(result);
      },
      (error: Error) => {
        console.error('❌ Error getting entitlements:', error);
        resolve(null);
      }
    );
  });
}

/**
 * Handle entitlements response from SWG
 */
function handleEntitlementsResponse(response: any): void {
  console.log('📦 Processing entitlements response');
}

/**
 * Handle subscribe response from SWG
 */
async function handleSubscribeResponse(response: any): Promise<void> {
  try {
    const { email, name } = response;
    console.log('🔄 Processing subscription response...');
  } catch (err) {
    console.error('❌ Error handling subscribe response:', err);
  }
}

/**
 * Handle link complete
 */
function handleLinkComplete(): void {
  console.log('🔗 Account linking complete');
}

/**
 * Attach SWG button to element
 */
export function attachSWGButton(element: HTMLElement): void {
  if (!window.SWG_BASIC) {
    console.error('❌ SWG SDK not initialized');
    return;
  }

  try {
    window.SWG_BASIC.attachButtonEl(element, {
      theme: 'light',
      lang: 'es',
    });
  } catch (err) {
    console.error('❌ Error attaching SWG button:', err);
  }
}

/**
 * Backward compatibility function
 */
export async function openSWGContributionDialog(productId?: string): Promise<boolean> {
  return openSWGDialog(productId);
}

/**
 * Check if SWG is available
 */
export function isSWGAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.SWG_BASIC;
}
