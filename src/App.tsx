import React, { useState, useEffect } from 'react';
import Data, { ContentData } from './components/_data/Data';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { DebugHeader } from './components/_debug/DebugHeader/DebugHeader';
import { Footbar } from './components/Footbar/Footbar';
import { useWindowWidth } from './hooks/useWindowWidth';
import { WindowWidthContext } from './contexts/WindowWidthContext';
import { LoadingScreen } from './components/LoadingScreen/LoadingScreen';
import { CustomAppBar } from './components/CustomAppBar/CustomAppBar';
import { DebugFonts } from './components/_debug/DebugFonts';
import "./App.css";

// comment out for production build
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import { ContentEditor } from './components/ContentEditor/ContentEditor';

// This line is to remove a bug that Firefox has
// TODO: insert link explaining why
window.addEventListener("unload", function () { });

type AppProps = {
    IEOREDGE: boolean,
    currYear: number
}
const debugURL = "/Editor";

/**
 * App is the main application that handles all the route logic and rendering.
 * 
 * Last Modified
 * William Kwok
 * June 16, 2019
 */
const App: React.FC<AppProps> = ({ IEOREDGE, currYear }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [contentData, setContentData] = useState<ContentData>(Data.getContentData());
    const [pageTitle, setPageTitle] = useState<string>(debugURL)
    const [debugMode, setDebugMode] = useState<boolean>(true);
    const windowWidth = useWindowWidth();

    let name = `https://${currYear}.igem.org/Team:Washington`;
    let imgsToPrefetch: string[] = Data.getImgsToPrefetch();
    let imgsLoaded = 0;

    const displayConstants = Data.getDisplayConstants(pageTitle);
    const theme = createMuiTheme({
        palette: {
            primary: {
                main: displayConstants.primaryColor as string
            },
            secondary: {
                main: displayConstants.secondaryColor as string
            }
        },
        typography: {
            fontFamily: "Raleway"
        }
    });

    /**
     * Upon component mount, this effect determines if it is currently on the live website or not.
     * It sets the `pageTitle` to be `debugURL` if not live, or the text after `"Team:Washington"`
     * in the URL.
     * 
     * eg "2019.igem.org/Team:Washington/Design" -> "/Design"
     */
    useEffect(() => {
        /**
         * Prefetch images will grab images to load in the background after the page has loaded
         */
        const prefetchImagesWaveTwo = () => {

        }

        /**
         * Prefetch images will grab images to load in the background after the page has loaded
         */
        const prefetchImages = () => {
            imgsToPrefetch.forEach((imgURL: string) => {
                const img = new Image();
                img.src = imgURL;
                img.onload = () => {
                    imgsLoaded++;
                    if (imgsLoaded === imgsToPrefetch.length) {
                        prefetchImagesWaveTwo();
                    }
                }
            })
        }
        prefetchImages();
        let splitTitle = window.location.href.split("igem");
        if (splitTitle.length === 2) {
            setPageTitle(splitTitle[1].split("Team:Washington")[1]);
            setDebugMode(false);
        } else {
            DebugFonts(); // Set fonts in body
        }
        setLoading(false);
        let dataRef: firebase.database.Reference | null = null;
        if (firebase) {
            dataRef = firebase.database().ref(`/${currYear}/ContentData`);
            if (dataRef) {
                dataRef.on("value", (snap) => {
                    setContentData(snap.val() as ContentData);
                });
            }

            return () => {
                if (dataRef) {
                    dataRef.off();
                }
            }
        } else {
            setContentData(Data.getContentData())
        }
    }, [pageTitle, imgsLoaded, imgsToPrefetch, currYear]);

    /**
     * Sets the loading state to true. This is used for in between pages. This function MUST be sent
     * down as a prop to ALL the pages, so the appropriate loading procedure takes place.
     * 
     * @example `From now on, we will pass it down like this`
     *   <CustomView a={this.displayLoadingMessage} />
     *   // in CustomView:
     *   render() {
     *       let a = this.props.a;
     *       return (
     *           <div>   
     *               <ChildView a={a} />
     *               <a href="_____" onClick={a} />
     *           </div>
     *       )
     *   }
     */
    const a = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 3000);
    }

    return <div className="App">
        <WindowWidthContext.Provider value={{ windowWidth }}>
            <MuiThemeProvider theme={theme}>
                {debugMode && <>
                    <DebugHeader />
                </>}

                <CustomAppBar name={name} pageTitle={pageTitle} a={a} />

                {!loading && <>
                    <div className={debugMode ? "app-content-dev" : "app-content-real"}>
                        {/** Comment out this in final build */}
                        {pageTitle === "/Editor" &&
                            <ContentEditor
                                contentData={contentData}
                            />}
                        {/*****************************************/}
                        {pageTitle !== "/Editor" &&
                            <div>This page is under construction</div>}
                    </div>
                    <Footbar a={a} />
                </>}

                {loading &&
                    <LoadingScreen />}
            </MuiThemeProvider>
        </WindowWidthContext.Provider>
    </div>
}


export default App;
