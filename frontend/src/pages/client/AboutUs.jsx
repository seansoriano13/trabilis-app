export default function AboutUs() {
    const AwardItem = ({ title, awarder }) => (
        <div className='flex flex-row gap-2'>
            <div className='flex-1 font-bold text-sm lg:text-xl text-left'>
                {title}
            </div>
            {awarder && (
                <div className='flex-1 text-sm lg:text-xl text-right'>
                    {awarder}
                </div>
            )}
        </div>
    )
    return (
        <>
            <section
                id='sectionHeadline'
                class='relative w-full h-screen xl:h-screen xl:max-h-screen bg-[#33333]'
            >
                <img
                    src='https://lindelatravel.com/images/header-bgs/lindela-infinity-pool.png'
                    class='absolute top-0 left-0 z-0 w-full h-full object-right xl:object-bottom object-cover brightness-40'
                />
                <div class='absolute top-0 left-0 w-full h-full bg-[#33333]/60'></div>
                <div class='relative w-full xl:max-w-[1166px] h-screen xl:h-screen mx-auto px-4 lg:px-8 xl:px-0 flex flex-col justify-between gap-4'>
                    <div
                        x-intersect:enter='stableNav = false'
                        x-intersect:leave='stableNav = true'
                    ></div>
                    <div class='w-full mx-auto mt-8 flex-1 flex flex-col justify-center'>
                        <p class='mt-4 font-poppins font-bold text-base lg:text-xl text-yellow-300'>
                            About Us
                        </p>
                        <h1 class='font-poppins font-bold text-white text-5xl lg:text-f64'>
                            Your Trusted Travel Partner
                        </h1>
                    </div>
                    <div class='w-full lg:w-9/12 xl:w-8/12 mb-8 flex flex-col lg:flex-row items-start lg:items-end justify-between lg:gap-4 text-white'>
                        <a
                            href='#sectionAbout'
                            class='lg:flex-1 py-2 pr-8 lg:pr-0 border-0 border-t border-[#b3b3b3] lg:font-bold hover:text-yellow-300 hover:border-yellow-300 transition-all'
                        >
                            Our Story
                        </a>
                        <a
                            href='#sectionMission'
                            class='lg:flex-1 py-2 pr-8 lg:pr-0 border-0 border-t border-[#b3b3b3] lg:font-bold hover:text-yellow-300 hover:border-yellow-300 transition-all'
                        >
                            Our Mission
                        </a>
                        <a
                            href='#sectionAwards'
                            class='lg:flex-1 py-2 pr-8 lg:pr-0 border-0 border-t border-[#b3b3b3] lg:font-bold hover:text-yellow-300 hover:border-yellow-300 transition-all'
                        >
                            Our Awards
                        </a>
                        <a
                            href='#sectionPartners'
                            class='lg:flex-1 py-2 pr-8 lg:pr-0 border-0 border-t border-[#b3b3b3] lg:font-bold hover:text-yellow-300 hover:border-yellow-300 transition-all'
                        >
                            Our Accreditations
                        </a>
                    </div>
                </div>
            </section>
            <section
                id='sectionAbout'
                class='w-full mt-8'
            >
                <div class='w-full max-w-[72.875rem] mx-auto px-4 lg:px-8 xl:px-0 py-8'>
                    <div>
                        <h2 class='font-poppins font-bold text-sm lg:text-base text-primary-500'>
                            Our Story
                        </h2>
                        <h3 class='font-poppins font-bold text-2xl lg:text-f40'>
                            LINDELA TRAVEL AND TOURS
                        </h3>
                    </div>

                    <div class='mt-6 lg:columns-2 gap-8 text-xs lg:text-lg'>
                        <p>
                            As the most trusted travel agency in the
                            Philippines, <b>Lindela Travel and Tours</b>{' '}
                            consistently strives to create high-quality travel
                            experiences tailored to our clients’ needs. Since
                            our founding in 2012, we have upheld the belief that
                            travel is much more than arriving at a destination.
                            We design our tours to inspire people to realize
                            their dreams, discover the world’s beauty, and leave
                            a lasting, positive impact on diverse communities.
                        </p>
                        <p class='mt-3'>
                            Our employees are pioneers in the travel industry,
                            benefiting from routine team-building and
                            educational opportunities. Led by expert Team
                            Managers and motivated Travel and Visa Consultants,
                            they excel in sales, training, and customer service,
                            delivering the highest standards of service.
                        </p>
                        <p class='mt-3'>
                            Each tour is created to encourage a unique
                            experience that will spark a love for traveling.
                            Seeing the world can be a transformative experience.
                            We hope to have the opportunity to travel with you.
                        </p>
                    </div>

                    <div className='grid grid-cols-2 grid-rows-2 gap-4'>
                        <div>
                            <h2 className='font-extrabold text-2xl'>12</h2>
                            <p className='text-xs'>Years of Experience</p>
                        </div>
                        <div>
                            <h2 className='font-extrabold text-2xl'>84</h2>
                            <p className='text-xs'>Trips Organized</p>
                        </div>
                        <div>
                            <h2 className='font-extrabold text-2xl'>100k+</h2>
                            <p className='text-xs'>Countries Visited</p>
                        </div>
                        <div>
                            <h2 className='font-extrabold text-2xl'>500k</h2>
                            <p className='text-xs'>Satisfied Clients</p>
                        </div>
                    </div>
                </div>
            </section>
            <section
                id='sectionMission'
                className='relative w-full mt-12 pt-12 pb-12 bg-fixed bg-center bg-cover shadow-in-fade-95 text-black'
                style={{
                    backgroundImage:
                        "url('https://lindelatravel.com/images/section-content/reception-telephone-booth-20240602.jpg')",
                }}
            >
                {/* Dark overlay */}
                <div className='absolute inset-0 bg-black/90'></div>

                {/* Content */}
                <div className='relative w-full max-w-[1166px] mx-auto px-4 lg:px-8 xl:px-0 text-white'>
                    <div className='mt-6 flex flex-col lg:flex-row gap-4 lg:gap-12'>
                        <div className='flex-1 flex flex-col gap-4 lg:gap-8'>
                            <div className='flex-1'>
                                <h5 className='font-poppins font-bold text-2xl lg:text-f40 text-yellow-300'>
                                    Mission
                                </h5>
                                <p className='mt-4 text-sm lg:text-base'>
                                    Our mission is to create unforgettable
                                    experiences that inspire a love for travel.
                                    By focusing on each of our employee’s unique
                                    growth potential, we can lead the industry
                                    with tours that have an invaluable impact on
                                    economies.
                                </p>
                            </div>
                            <div className='flex-1'>
                                <h5 className='font-poppins font-bold text-2xl lg:text-f40 text-yellow-300'>
                                    Vision
                                </h5>
                                <p className='mt-4 text-sm lg:text-base'>
                                    To become the standard for superior travel
                                    and tour agencies acknowledged for our
                                    dedication to delivering exceptional
                                    service, building healthy communities, and
                                    putting people at the center of everything
                                    we do.
                                </p>
                            </div>
                        </div>
                        <div className='flex-1'>
                            <h5 className='font-poppins font-bold text-2xl lg:text-f40 text-yellow-300'>
                                Values
                            </h5>
                            <ol className='mt-4 flex flex-col gap-4'>
                                <li className='flex gap-3'>
                                    <div className='font-bold text-sm lg:text-lg'>
                                        1
                                    </div>
                                    <div>
                                        <div className='font-bold text-base lg:text-lg'>
                                            Passion
                                        </div>
                                        <div className='text-sm lg:text-base'>
                                            We bring passion to the industry of
                                            travel.
                                        </div>
                                    </div>
                                </li>
                                <li className='flex gap-3'>
                                    <div className='font-bold text-sm lg:text-lg'>
                                        2
                                    </div>
                                    <div>
                                        <div className='font-bold text-base lg:text-lg'>
                                            Professionalism
                                        </div>
                                        <div className='text-sm lg:text-base'>
                                            We are driven by professionalism and
                                            commitment to quality service.
                                        </div>
                                    </div>
                                </li>
                                <li className='flex gap-3'>
                                    <div className='font-bold text-sm lg:text-lg'>
                                        3
                                    </div>
                                    <div>
                                        <div className='font-bold text-base lg:text-lg'>
                                            Inspiration
                                        </div>
                                        <div className='text-sm lg:text-base'>
                                            We inspire our employees to be
                                            leaders and foster self-improvement.
                                        </div>
                                    </div>
                                </li>
                                <li className='flex gap-3'>
                                    <div className='font-bold text-sm lg:text-lg'>
                                        4
                                    </div>
                                    <div>
                                        <div className='font-bold text-base lg:text-lg'>
                                            Community
                                        </div>
                                        <div className='text-sm lg:text-base'>
                                            We strengthen communities by buying
                                            from local businesses.
                                        </div>
                                    </div>
                                </li>
                                <li className='flex gap-3'>
                                    <div className='font-bold text-sm lg:text-lg'>
                                        5
                                    </div>
                                    <div>
                                        <div className='font-bold text-base lg:text-lg'>
                                            Boldness
                                        </div>
                                        <div className='text-sm lg:text-base'>
                                            We encourage clients to be bold and
                                            explore new places.
                                        </div>
                                    </div>
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </section>
            <section
                id='sectionAwards'
                className='w-full my-8 text-black'
            >
                <div className='w-full max-w-[1166px] mx-auto px-4 lg:px-8 xl:px-0'>
                    <div>
                        <h2 className='font-bold text-primary-500'>
                            Our Awards
                        </h2>
                        <h3 className='font-poppins font-bold text-2xl lg:text-f40'>
                            Awards &amp; Recognitions
                        </h3>
                    </div>
                    <ul className='mt-6 flex flex-col gap-4'>
                        {/* 2024 */}
                        <li className='lg:grid lg:grid-cols-8 xl:grid-cols-12 xl:gap-4 border-0 border-t border-secondary-200'>
                            <div className='py-2 px-2 lg:col-span-1 xl:col-span-2 text-2xl lg:text-f32 font-bold lg:font-normal'>
                                2024
                            </div>
                            <div className='py-2 px-2 lg:col-span-7 xl:col-span-10 flex flex-col gap-4'>
                                <AwardItem
                                    title='Top agent Award'
                                    awarder='Via Philippines'
                                />
                                <AwardItem
                                    title='Top Producer Award'
                                    awarder='Via Philippines'
                                />
                                <AwardItem
                                    title='Phoenix Award'
                                    awarder='Via Philippines'
                                />
                                <AwardItem
                                    title='Emerald Club Award'
                                    awarder='Via Philippines'
                                />
                                <AwardItem
                                    title='Best Travel and Tours Services Provider'
                                    awarder='24th World Excellence Awards'
                                />
                                <AwardItem
                                    title='Best Visa & Immigration Consultancy'
                                    awarder='24th World Excellence Awards'
                                />
                                <AwardItem
                                    title='Excellence in Business and Entrepreneurship'
                                    awarder='24th World Excellence Awards'
                                />
                                <AwardItem
                                    title='Plaque of Recognition'
                                    awarder='Saudia Airlines'
                                />
                            </div>
                        </li>

                        {/* 2023 */}
                        <li className='lg:grid lg:grid-cols-8 xl:grid-cols-12 xl:gap-4 border-0 border-t border-secondary-200'>
                            <div className='py-2 px-2 lg:col-span-1 xl:col-span-2 text-2xl lg:text-f32 font-bold lg:font-normal'>
                                2023
                            </div>
                            <div className='py-2 px-2 lg:col-span-7 xl:col-span-10 flex flex-col gap-4'>
                                <AwardItem
                                    title='Top Agent Award'
                                    awarder='Qatar Airways'
                                />
                                <AwardItem
                                    title='Top Travel Agent Award'
                                    awarder='EVA Airways Corp'
                                />
                                <AwardItem
                                    title='Top Agent Award'
                                    awarder='Etihad Airways'
                                />
                                <AwardItem
                                    title='Top Producer Award'
                                    awarder='Via Philippines'
                                />
                                <AwardItem
                                    title='Emerald Club Award'
                                    awarder='Via Philippines'
                                />
                                <AwardItem
                                    title='Phoenix Award'
                                    awarder='Via Philippines'
                                />
                            </div>
                        </li>

                        {/* 2022 */}
                        <li className='lg:grid lg:grid-cols-8 xl:grid-cols-12 xl:gap-4 border-0 border-t border-secondary-200'>
                            <div className='py-2 px-2 lg:col-span-1 xl:col-span-2 text-2xl lg:text-f32 font-bold lg:font-normal'>
                                2022
                            </div>
                            <div className='py-2 px-2 lg:col-span-7 xl:col-span-10 flex flex-col gap-4'>
                                <AwardItem
                                    title='Top Agent Award'
                                    awarder='Via Philippines'
                                />
                                <AwardItem
                                    title='Hall of Fame Award'
                                    awarder='Via Philippines'
                                />
                                <AwardItem
                                    title='Asia’s Most Trusted Travel and Tours of the Year'
                                    awarder='5th Asia Pacific Luminare Awards'
                                />
                            </div>
                        </li>

                        {/* 2020 */}
                        <li className='lg:grid lg:grid-cols-8 xl:grid-cols-12 xl:gap-4 border-0 border-t border-secondary-200'>
                            <div className='py-2 px-2 lg:col-span-1 xl:col-span-2 text-2xl lg:text-f32 font-bold lg:font-normal'>
                                2020
                            </div>
                            <div className='py-2 px-2 lg:col-span-7 xl:col-span-10 flex flex-col gap-4'>
                                <AwardItem
                                    title='Travel Agency Partner Special Award'
                                    awarder='Liberty Insurance Corporation'
                                />
                            </div>
                        </li>

                        {/* 2019 */}
                        <li className='lg:grid lg:grid-cols-8 xl:grid-cols-12 xl:gap-4 border-0 border-t border-secondary-200'>
                            <div className='py-2 px-2 lg:col-span-1 xl:col-span-2 text-2xl lg:text-f32 font-bold lg:font-normal'>
                                2019
                            </div>
                            <div className='py-2 px-2 lg:col-span-7 xl:col-span-10 flex flex-col gap-4'>
                                <AwardItem title='Hangjigyo Korea Bridge Appreciation Award' />
                                <AwardItem title='Lindela Hall of Fame Award' />
                            </div>
                        </li>

                        {/* 2018 */}
                        <li className='lg:grid lg:grid-cols-8 xl:grid-cols-12 xl:gap-4 border-0 border-t border-secondary-200'>
                            <div className='py-2 px-2 lg:col-span-1 xl:col-span-2 text-2xl lg:text-f32 font-bold lg:font-normal'>
                                2018
                            </div>
                            <div className='py-2 px-2 lg:col-span-7 xl:col-span-10 flex flex-col gap-4'>
                                <AwardItem
                                    title='Hall of Fame Award'
                                    awarder='Via Philippines'
                                />
                                <AwardItem
                                    title='Top Choice Travel & Tour Services Provider International Awards'
                                    awarder='Philippine Top Choice Awards for Excellence and outstanding achievers'
                                />
                                <AwardItem
                                    title='Hong Kong Top Producer'
                                    awarder='Hong Kong Tourism Board'
                                />
                            </div>
                        </li>

                        {/* 2017 */}
                        <li className='lg:grid lg:grid-cols-8 xl:grid-cols-12 xl:gap-4 border-0 border-t border-secondary-200'>
                            <div className='py-2 px-2 lg:col-span-1 xl:col-span-2 text-2xl lg:text-f32 font-bold lg:font-normal'>
                                2017
                            </div>
                            <div className='py-2 px-2 lg:col-span-7 xl:col-span-10 flex flex-col gap-4'>
                                <AwardItem
                                    title='Great Summer Sale Winner'
                                    awarder='Asia Travel Philippines'
                                />
                                <AwardItem title='Most Outstanding Travel Agency Service Provider' />
                            </div>
                        </li>
                    </ul>
                </div>
            </section>
        </>
    )
}
